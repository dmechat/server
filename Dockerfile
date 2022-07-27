FROM public.ecr.aws/lambda/nodejs:14

# package-lock.json
COPY package.json nest-cli.json tsconfig.build.json tsconfig.json ${LAMBDA_TASK_ROOT}/ 
copy src public ${LAMBDA_TASK_ROOT}/src/
copy public ${LAMBDA_TASK_ROOT}/public/


RUN ls ${LAMBDA_TASK_ROOT}

RUN npm install
# RUN npm run generate-licenses-txt
RUN npm run build

RUN ls ${LAMBDA_TASK_ROOT}

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "dist/main.handler" ] 
