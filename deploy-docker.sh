set -e

# entire script to build the docker image
docker build -t rest-api-lambdas .

export CDK_DEFAULT_ACCOUNT=`aws configure get aws_account_id`
export CDK_DEFAULT_REGION=`aws configure get region`

# log into docker
echo "logging in now"
docker login -u AWS -p $(aws ecr get-login-password --region $CDK_DEFAULT_REGION) $CDK_DEFAULT_ACCOUNT.dkr.ecr.$CDK_DEFAULT_REGION.amazonaws.com

# push the image to docker
echo "tagging now"
docker tag rest-api-lambdas:latest $CDK_DEFAULT_ACCOUNT.dkr.ecr.$CDK_DEFAULT_REGION.amazonaws.com/rest-api-lambdas-$ENVIRONMENT:latest

# trigger .cicd as well
echo "pushing now"
docker push $CDK_DEFAULT_ACCOUNT.dkr.ecr.$CDK_DEFAULT_REGION.amazonaws.com/rest-api-lambdas-$ENVIRONMENT:latest

# cd .cicd
# npm install 
# npm run cdk -- deploy DatabaseStack-${ENVIRONMENT} --require-approval never
# npm run cdk -- deploy RepositoryStack-${ENVIRONMENT} --require-approval never
# npm run cdk -- deploy ApiStack-${ENVIRONMENT} --require-approval never
