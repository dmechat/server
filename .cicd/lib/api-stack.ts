import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { DockerImageFunction } from 'aws-cdk-lib/aws-lambda';
import { Effect, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { getImageTag } from './utils';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { CloudFormation, ECR, Route53 } from "aws-sdk";
import { EndpointType, LambdaRestApi, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import * as targets from "aws-cdk-lib/aws-route53-targets";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ApiStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here

        // example resource
        // const queue = new sqs.Queue(this, 'CdkQueue', {
        //   visibilityTimeout: cdk.Duration.seconds(300)
        // });
        this.buildStack();
    }

    async buildStack() {
        const lambdaHandler = await this.buildLambda();
        const api = await this.buildApi(lambdaHandler);
        const routing = await this.buildRouting(api as any);
    }

    async getWebSocketStackOutputs() {
        const StackName = `WebSocketApi-${process.env.ENVIRONMENT}`;
        const stacks = await new CloudFormation({ region: process.env.REGION }).describeStacks({
            StackName
        }).promise();
        const stack = stacks.Stacks?.find(s => s.StackName == StackName);
        return stack?.Outputs;
    }

    async buildLambda() {
        // const webSocketAPIStackOutputs = await this.getWebSocketStackOutputs();
        const websocketTableName = Table.fromTableName(this, "WsConnectionsTable", `ws_connections_${process.env.ENVIRONMENT}`);
        const dataTableName = Table.fromTableName(this, "DataTable", `data_${process.env.ENVIRONMENT}`);
        const name = "ApiHandler";

        const repository = Repository.fromRepositoryName(this, "ECRRepository", `rest-api-lambdas-${process.env.ENVIRONMENT}@${await getImageTag()}`);
        const handler = new DockerImageFunction(this, name, {
            code: lambda.DockerImageCode.fromEcr(repository, { tag: "" }),
            environment: {
                "SECRET": "Value",
                "ENVIRONMENT": process.env.ENVIRONMENT!,
                "REGION": process.env.REGION!,
                "ACCOUNT_CREDENTIALS": process.env.ACCOUNT_CREDENTIALS!,
                "NETWORK_ID": process.env.NETWORK_ID!,
                "FIREBASE_CREDENTIALS": process.env.FIREBASE_CREDENTIALS!,
                "FIREBASE_DATABASE_URL": process.env.FIREBASE_DATABASE_URL!,
            },
            timeout: Duration.seconds(15),
            memorySize: 512
        });
        // handler.addToRolePolicy(new iam.PolicyStatement({
        //     actions: ["secretsmanager:Describe*",
        //         "secretsmanager:Get*",
        //         "secretsmanager:List*",
        //         "ssm:GetParameter"
        //     ],
        //     effect: iam.Effect.ALLOW,
        //     resources: ["*"],
        //     sid: "ReadSecretManager"
        // }));
        // handler.addToRolePolicy(new iam.PolicyStatement({
        //     actions: ["cloudformation:DescribeStacks",
        //     ],
        //     effect: iam.Effect.ALLOW,
        //     resources: ["*"],
        //     sid: "ReadCFStackPermission"
        // }));
        // const websocketExecuteResource = webSocketAPIStackOutputs?.find(o => o.OutputKey?.includes("WSExecuteApi"));
        // handler.addToRolePolicy(new PolicyStatement({
        //     actions: ["execute-api:ManageConnections"],
        //     effect: Effect.ALLOW,
        //     resources: [
        //         websocketExecuteResource?.OutputValue as any
        //         // `arn:aws:execute-api:${region}:${account}:${'pptsz0qcci'}/${BASE_PATH}/POST/@connections/{connectionId}`
        //         // wsExecuteApiArn
        //     ],
        //     sid: "ExecuteApiManageConnections"
        // }));
        handler.addToRolePolicy(new PolicyStatement({
            actions: ["dynamodb:DeleteItem", "dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:Scan", "dynamodb:Query", "dynamodb:UpdateItem"],
            effect: Effect.ALLOW,
            resources: [dataTableName.tableArn, websocketTableName.tableArn],
            sid: "DataDynamoDbAccess"
        }));
        return handler;
    }

    async getApiDomainCertificateArn() {
        return new Promise<string | undefined>((resolve, reject) => {
            new CloudFormation({
                region: "us-east-1"
            }).listStackResources({
                StackName: "CertificatesStack",
            }).promise()
                .then(r => {
                    const summary = r.StackResourceSummaries?.find(s => s.LogicalResourceId.toLowerCase().startsWith(`Api${process.env.ENVIRONMENT}AcmCertificate`.toLowerCase()));
                    return resolve(summary?.PhysicalResourceId)
                })
                .catch(reject);
        })
    }

    async buildApi(handler: lambda.Function) {
        const region = process.env.CDK_DEFAULT_REGION;
        const uri = `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${handler.functionArn}/invocations`;
        const domainName = `api-${process.env.ENVIRONMENT}.dme.chat`;
        const apiDomainCertificateArn = await this.getApiDomainCertificateArn();
        const certificate = Certificate.fromCertificateArn(this, "ApiAcmCertificate", apiDomainCertificateArn!);
        const apiConfig = {
            handler,
            deployOptions: { stageName: process.env.ENVIRONMENT },
            domainName: {
                domainName,
                certificate,
                endpointType: EndpointType.EDGE
            },
            restApiName: domainName,
            binaryMediaTypes: ["multipart/form-data"]

        };

        const restApi = new LambdaRestApi(this, "RestApi", apiConfig);

        const servicePrinciple = new ServicePrincipal("apigateway.amazonaws.com");
        new lambda.CfnPermission(this, "ApiHandlerInvokePermission", {
            functionName: handler.functionName,
            action: "lambda:InvokeFunction",
            principal: "apigateway.amazonaws.com"
        });
        return restApi;
    }

    async buildRouting(restApi: RestApi) {
        const domainName = `api-${process.env.ENVIRONMENT}.dme.chat`;
        const hostedZones = await new Route53().listHostedZones().promise();
        const zone = hostedZones.HostedZones.find(zone => zone.Name == "dme.chat.")!;
        new ARecord(this, 'CustomDomainAliasRecordForApi', {
            zone: HostedZone.fromHostedZoneId(this, "HostedZoneId", zone.Id.replace("/hostedzone/", "")),
            target: RecordTarget.fromAlias(new targets.ApiGateway(restApi)),
            recordName: `${domainName}.`
        });
    }
}
