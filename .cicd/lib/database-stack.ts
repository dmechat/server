import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DatabaseStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const environment = process.env.ENVIRONMENT;
    
    // All data is stored in this single table
    new Table(this, "Data", {
        partitionKey: { type: AttributeType.STRING, name: "PartitionKey" },
        sortKey: { type: AttributeType.STRING, name: "SortKey" },
        tableName: `data_${environment}`,
        billingMode: BillingMode.PAY_PER_REQUEST,
        pointInTimeRecovery: true,
    });

    // All web socket data is stored in here
    new Table(this, "WSConnections", {
        partitionKey: { type: AttributeType.STRING, name: "PartitionKey" },
        sortKey: { type: AttributeType.STRING, name: "SortKey" },
        tableName: `ws_connections_${environment}`,
        removalPolicy: RemovalPolicy.DESTROY,
        timeToLiveAttribute: "ttl",
        billingMode: BillingMode.PAY_PER_REQUEST
    });
  }
}
