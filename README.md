# Inventory Demand Forecasting System

A comprehensive inventory demand forecasting system built with AWS services, featuring machine learning-powered predictions, real-time analytics, and a modern React frontend.

## Architecture Overview

This system provides intelligent inventory demand forecasting using:
- **AWS SageMaker** for machine learning model training and inference
- **AWS Lambda** for serverless data processing
- **Amazon DynamoDB** for scalable data storage
- **Amazon S3** for data lake and model artifacts
- **Amazon API Gateway** for RESTful API endpoints
- **React Frontend** with Material-UI for user interface
- **AWS CDK** for infrastructure as code

## Features

- Real-time demand forecasting using machine learning
- Historical data analysis and trend visualization
- Inventory optimization recommendations
- RESTful API for integration with existing systems
- Responsive web dashboard with interactive charts
- Automated model retraining and deployment
- Scalable serverless architecture

## Project Structure

```
├── backend/                 # Lambda functions and API logic
├── cdk/                    # AWS CDK infrastructure code
├── frontend/               # React application
├── generated-diagrams/     # Architecture diagrams
├── pricing/               # Cost analysis and estimates
├── specs/                 # Technical specifications
├── qr-code/              # QR code for project access
└── PROJECT_SUMMARY.md    # Comprehensive project overview
```

## Quick Start

### Prerequisites
- AWS CLI configured with appropriate permissions
- Node.js 18+ and npm
- AWS CDK CLI installed globally

### Deployment

1. **Deploy Infrastructure**
   ```bash
   cd cdk
   npm install
   cdk deploy
   ```

2. **Build and Deploy Frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. **Access the Application**
   - API Gateway endpoint will be provided after CDK deployment
   - Frontend can be deployed to S3 + CloudFront or served locally

## API Endpoints

- `GET /forecasts` - Retrieve demand forecasts
- `POST /forecasts` - Generate new forecasts
- `GET /inventory` - Get current inventory levels
- `POST /inventory` - Update inventory data
- `GET /analytics` - Retrieve analytics data

## Technology Stack

### Backend
- AWS Lambda (Node.js/Python)
- Amazon DynamoDB
- Amazon S3
- AWS SageMaker
- Amazon API Gateway

### Frontend
- React 18 with TypeScript
- Material-UI (MUI)
- Chart.js for data visualization
- Axios for API communication

### Infrastructure
- AWS CDK (TypeScript)
- CloudFormation templates
- IAM roles and policies

## Cost Optimization

The system is designed for cost efficiency:
- Serverless architecture reduces idle costs
- DynamoDB on-demand pricing for variable workloads
- S3 Intelligent Tiering for data storage optimization
- Lambda provisioned concurrency only when needed

See `pricing/cost_analysis_report.md` for detailed cost breakdown.

## Monitoring and Observability

- CloudWatch metrics and alarms
- X-Ray tracing for distributed requests
- Custom dashboards for business metrics
- Automated error notifications

## Security

- IAM least-privilege access
- API Gateway authentication
- VPC endpoints for private communication
- Encryption at rest and in transit

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please refer to the technical documentation in the `specs/` directory or create an issue in the repository.
