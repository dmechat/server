import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Repository, TagMutability, TagStatus } from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';
import { REPOSITORY_NAME } from './utils';

export class RepositoryStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const restApiLambdasRepo = new Repository(this, "ECRRepository", {
      imageScanOnPush: true,
      imageTagMutability: TagMutability.MUTABLE,
      removalPolicy: RemovalPolicy.DESTROY,
      repositoryName: REPOSITORY_NAME(),
    });

    restApiLambdasRepo.addLifecycleRule({
      tagStatus: TagStatus.UNTAGGED,
      maxImageAge: Duration.days(7)
    });

  }
}
