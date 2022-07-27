import { ECR, config, SharedIniFileCredentials } from "aws-sdk";

export const REPOSITORY_NAME = () => `rest-api-lambdas-${process.env.ENVIRONMENT}`;

export async function getImageTag() {
    config.region = process.env.CDK_DEFAULT_REGION!;
    config.credentials = new SharedIniFileCredentials({ profile: process.env.AWS_DEFAULT_PROFILE });
    const ecr = new ECR({ region: process.env.REGION });
    const images = await ecr.listImages({ repositoryName: REPOSITORY_NAME() }).promise();
    const image = images.imageIds?.find(image => image.imageTag == "latest");
    return image?.imageDigest;
}