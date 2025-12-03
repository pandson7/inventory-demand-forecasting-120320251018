# Backend Lambda Functions

This directory contains the AWS Lambda functions that power the inventory demand forecasting system.

## Structure

The Lambda functions are defined and deployed through the AWS CDK infrastructure code in the `../cdk` directory.

## Functions

1. **Forecast Generation** - Generates demand forecasts using SageMaker
2. **Data Processing** - Processes incoming sales and inventory data
3. **Analytics** - Provides analytics and reporting endpoints
4. **Inventory Management** - Handles inventory CRUD operations

## Deployment

Lambda functions are automatically packaged and deployed when running:

```bash
cd ../cdk
cdk deploy
```

The CDK will bundle the Lambda code and create the necessary AWS resources.

## Environment Variables

Each Lambda function receives environment variables for:
- DynamoDB table names
- S3 bucket names
- SageMaker endpoint names
- API Gateway configuration

## Monitoring

All Lambda functions include:
- CloudWatch logging
- X-Ray tracing
- Custom metrics
- Error handling and alerting
