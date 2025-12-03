# AWS Architecture Diagrams - Inventory Demand Forecasting MVP

## Generated Diagrams

### 1. Main Architecture Diagram
**File:** `inventory-forecasting-architecture.png`
**Description:** High-level system architecture showing the core components and their relationships.

**Key Components:**
- React Frontend for user interface
- API Gateway for REST endpoints
- Lambda functions for serverless compute
- DynamoDB tables for data storage
- Amazon Bedrock for ML inference
- S3 for file storage
- CloudWatch for monitoring

### 2. Data Flow Diagram
**File:** `forecasting-data-flow.png`
**Description:** Detailed data flow showing the demand forecasting process from data upload to results display.

**Process Flow:**
1. User uploads CSV data via React UI
2. API Gateway routes to Lambda processors
3. Data validation and ETL processing
4. Storage in DynamoDB tables
5. Forecast generation using Amazon Bedrock
6. Results display in dashboard

### 3. Complete System Overview
**File:** `complete-system-overview.png`
**Description:** Comprehensive system architecture with all components, user types, and infrastructure details.

**Detailed Components:**
- Multiple user types (Business Analyst, Inventory Manager)
- Frontend layer with React and Chart.js
- API Gateway with CORS configuration
- Serverless compute layer with specialized Lambda functions
- Machine Learning layer with Bedrock and feature engineering
- Complete data storage layer
- Monitoring and infrastructure management

## Architecture Highlights

### Serverless Design
- Fully serverless architecture using Lambda functions
- Auto-scaling based on demand
- Pay-per-use pricing model

### Data Storage Strategy
- DynamoDB for structured data with separate tables for:
  - Products (catalog information)
  - Sales (historical transaction data)
  - Forecasts (prediction results)
  - Inventory (current stock levels)

### Machine Learning Integration
- Amazon Bedrock with Claude 4 for demand forecasting
- Feature engineering for time series analysis
- Business rules application for realistic predictions

### Security & Monitoring
- API Gateway with request validation
- CloudWatch for comprehensive logging and metrics
- S3 bucket policies for secure file uploads

### Infrastructure as Code
- AWS CDK for deployment automation
- Version-controlled infrastructure
- Consistent environment provisioning

## File Locations
All diagrams are stored in:
`/home/pandson/echo-architect-artifacts/inventory-demand-forecasting-120320251018/generated-diagrams/generated-diagrams/`

## Technical Specifications
- **Frontend:** React with Chart.js for visualization
- **API:** REST endpoints via API Gateway
- **Compute:** AWS Lambda (Node.js/Python)
- **Database:** DynamoDB with on-demand pricing
- **ML:** Amazon Bedrock (Claude 4)
- **Storage:** S3 for file uploads and static assets
- **Monitoring:** CloudWatch Logs and Metrics
- **Deployment:** AWS CDK
