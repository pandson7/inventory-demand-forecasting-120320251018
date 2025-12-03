import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class InventoryForecastingStack120320251018 extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const suffix = '120320251018';

    // DynamoDB Tables
    const productsTable = new dynamodb.Table(this, `ProductsTable${suffix}`, {
      tableName: `products-${suffix}`,
      partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const salesTable = new dynamodb.Table(this, `SalesTable${suffix}`, {
      tableName: `sales-${suffix}`,
      partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const forecastsTable = new dynamodb.Table(this, `ForecastsTable${suffix}`, {
      tableName: `forecasts-${suffix}`,
      partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'forecast_date', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const inventoryTable = new dynamodb.Table(this, `InventoryTable${suffix}`, {
      tableName: `inventory-${suffix}`,
      partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // S3 Bucket for file uploads
    const uploadBucket = new s3.Bucket(this, `UploadBucket${suffix}`, {
      bucketName: `inventory-uploads-${suffix}`,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.POST, s3.HttpMethods.PUT],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
        maxAge: 3000
      }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    // IAM Role for Lambda functions
    const lambdaRole = new iam.Role(this, `LambdaRole${suffix}`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
      ],
      inlinePolicies: {
        DynamoDBAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['dynamodb:*'],
              resources: [
                productsTable.tableArn,
                salesTable.tableArn,
                forecastsTable.tableArn,
                inventoryTable.tableArn
              ]
            })
          ]
        }),
        S3Access: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
              resources: [`${uploadBucket.bucketArn}/*`]
            })
          ]
        }),
        BedrockAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['bedrock:InvokeModel'],
              resources: [
                `arn:aws:bedrock:us-east-1:${this.account}:inference-profile/global.anthropic.claude-sonnet-4-20250514-v1:0`,
                `arn:aws:bedrock:*::foundation-model/anthropic.claude-sonnet-4-20250514-v1:0`
              ]
            })
          ]
        })
      }
    });

    // Lambda Functions
    const productsFunction = new lambda.Function(this, `ProductsFunction${suffix}`, {
      functionName: `products-handler-${suffix}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.PRODUCTS_TABLE;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const method = event.httpMethod;
    const path = event.path;
    
    if (method === 'POST' && path === '/api/products') {
      const body = JSON.parse(event.body);
      const productId = \`product_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
      
      const item = {
        product_id: productId,
        sk: 'PRODUCT',
        product_name: body.product_name,
        category: body.category,
        price: body.price,
        supplier: body.supplier || '',
        lead_time_days: body.lead_time_days || 7,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      }));

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, product: item })
      };
    }

    if (method === 'GET' && path === '/api/products') {
      const result = await docClient.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'sk = :sk',
        ExpressionAttributeValues: { ':sk': 'PRODUCT' }
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ products: result.Items || [] })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};`),
      environment: {
        PRODUCTS_TABLE: productsTable.tableName
      },
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30)
    });

    const salesFunction = new lambda.Function(this, `SalesFunction${suffix}`, {
      functionName: `sales-handler-${suffix}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});

const SALES_TABLE = process.env.SALES_TABLE;
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const method = event.httpMethod;
    const path = event.path;

    if (method === 'POST' && path === '/api/sales/upload') {
      const body = JSON.parse(event.body);
      const csvData = body.csvData;
      
      const lines = csvData.split('\\n').filter(line => line.trim());
      const headers_csv = lines[0].split(',').map(h => h.trim());
      
      const salesRecords = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 4) {
          const record = {
            product_id: values[0],
            sk: \`\${values[1]}#\${Date.now()}_\${i}\`,
            quantity_sold: parseInt(values[2]) || 0,
            sale_date: values[1],
            unit_price: parseFloat(values[3]) || 0,
            total_revenue: (parseInt(values[2]) || 0) * (parseFloat(values[3]) || 0),
            created_at: new Date().toISOString()
          };
          salesRecords.push(record);
        }
      }

      // Batch write to DynamoDB
      const batchSize = 25;
      for (let i = 0; i < salesRecords.length; i += batchSize) {
        const batch = salesRecords.slice(i, i + batchSize);
        const putRequests = batch.map(record => ({
          PutRequest: { Item: record }
        }));

        await docClient.send(new BatchWriteCommand({
          RequestItems: {
            [SALES_TABLE]: putRequests
          }
        }));
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: \`Uploaded \${salesRecords.length} sales records\`,
          records: salesRecords.length
        })
      };
    }

    if (method === 'GET' && path.startsWith('/api/sales/')) {
      const productId = path.split('/').pop();
      
      const result = await docClient.send(new QueryCommand({
        TableName: SALES_TABLE,
        KeyConditionExpression: 'product_id = :pid',
        ExpressionAttributeValues: { ':pid': productId }
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ sales: result.Items || [] })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};`),
      environment: {
        SALES_TABLE: salesTable.tableName,
        PRODUCTS_TABLE: productsTable.tableName
      },
      role: lambdaRole,
      timeout: cdk.Duration.seconds(60)
    });

    const forecastFunction = new lambda.Function(this, `ForecastFunction${suffix}`, {
      functionName: `forecast-handler-${suffix}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const bedrockClient = new BedrockRuntimeClient({ region: 'us-east-1' });

const SALES_TABLE = process.env.SALES_TABLE;
const FORECASTS_TABLE = process.env.FORECASTS_TABLE;
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const method = event.httpMethod;
    const path = event.path;

    if (method === 'POST' && path === '/api/forecasts/generate') {
      const body = JSON.parse(event.body);
      const productId = body.product_id;

      // Get historical sales data
      const salesResult = await docClient.send(new QueryCommand({
        TableName: SALES_TABLE,
        KeyConditionExpression: 'product_id = :pid',
        ExpressionAttributeValues: { ':pid': productId }
      }));

      const salesData = salesResult.Items || [];
      if (salesData.length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'No sales data found for product' })
        };
      }

      // Prepare data for Bedrock
      const salesSummary = salesData.map(sale => ({
        date: sale.sale_date,
        quantity: sale.quantity_sold,
        revenue: sale.total_revenue
      })).sort((a, b) => new Date(a.date) - new Date(b.date));

      const prompt = \`Analyze the following sales data and generate a 30-day demand forecast:

Sales Data: \${JSON.stringify(salesSummary)}

Please provide a JSON response with the following structure:
{
  "forecasts": [
    {
      "date": "YYYY-MM-DD",
      "predicted_demand": number,
      "confidence_lower": number,
      "confidence_upper": number
    }
  ],
  "insights": "Brief analysis of trends and patterns"
}

Generate forecasts for the next 30 days starting from today. Consider seasonal patterns, trends, and demand variability.\`;

      const bedrockResponse = await bedrockClient.send(new InvokeModelCommand({
        modelId: 'global.anthropic.claude-sonnet-4-20250514-v1:0',
        contentType: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      }));

      const responseBody = JSON.parse(new TextDecoder().decode(bedrockResponse.body));
      const content = responseBody.content[0].text;
      
      // Extract JSON from markdown if present
      const jsonMatch = content.match(/\`\`\`json\\n([\\s\\S]*?)\\n\`\`\`/) || content.match(/\`\`\`\\n([\\s\\S]*?)\\n\`\`\`/) || [null, content];
      const forecastData = JSON.parse(jsonMatch[1] || content);

      // Store forecasts in DynamoDB
      const forecastRecords = [];
      for (const forecast of forecastData.forecasts) {
        const record = {
          product_id: productId,
          forecast_date: forecast.date,
          predicted_demand: forecast.predicted_demand,
          confidence_interval_lower: forecast.confidence_lower,
          confidence_interval_upper: forecast.confidence_upper,
          model_version: 'claude-4-v1',
          created_at: new Date().toISOString()
        };
        
        await docClient.send(new PutCommand({
          TableName: FORECASTS_TABLE,
          Item: record
        }));
        
        forecastRecords.push(record);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          forecasts: forecastRecords,
          insights: forecastData.insights
        })
      };
    }

    if (method === 'GET' && path.startsWith('/api/forecasts/')) {
      const productId = path.split('/').pop();
      
      const result = await docClient.send(new QueryCommand({
        TableName: FORECASTS_TABLE,
        KeyConditionExpression: 'product_id = :pid',
        ExpressionAttributeValues: { ':pid': productId },
        ScanIndexForward: false,
        Limit: 30
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ forecasts: result.Items || [] })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};`),
      environment: {
        SALES_TABLE: salesTable.tableName,
        FORECASTS_TABLE: forecastsTable.tableName,
        PRODUCTS_TABLE: productsTable.tableName
      },
      role: lambdaRole,
      timeout: cdk.Duration.seconds(120)
    });

    const inventoryFunction = new lambda.Function(this, `InventoryFunction${suffix}`, {
      functionName: `inventory-handler-${suffix}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const INVENTORY_TABLE = process.env.INVENTORY_TABLE;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const method = event.httpMethod;
    const path = event.path;

    if (method === 'GET' && path === '/api/inventory') {
      const result = await docClient.send(new ScanCommand({
        TableName: INVENTORY_TABLE,
        FilterExpression: 'sk = :sk',
        ExpressionAttributeValues: { ':sk': 'CURRENT' }
      }));

      const inventory = result.Items || [];
      const alerts = inventory.filter(item => 
        item.current_stock <= item.reorder_point
      ).map(item => ({
        product_id: item.product_id,
        current_stock: item.current_stock,
        reorder_point: item.reorder_point,
        alert_type: 'LOW_STOCK',
        message: \`Product \${item.product_id} is below reorder point\`
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ inventory, alerts })
      };
    }

    if (method === 'PUT' && path.startsWith('/api/inventory/')) {
      const productId = path.split('/').pop();
      const body = JSON.parse(event.body);

      const item = {
        product_id: productId,
        sk: 'CURRENT',
        current_stock: body.current_stock,
        reorder_point: body.reorder_point || 10,
        max_stock: body.max_stock || 100,
        last_updated: new Date().toISOString()
      };

      await docClient.send(new PutCommand({
        TableName: INVENTORY_TABLE,
        Item: item
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, inventory: item })
      };
    }

    if (method === 'GET' && path === '/api/inventory/alerts') {
      const result = await docClient.send(new ScanCommand({
        TableName: INVENTORY_TABLE,
        FilterExpression: 'sk = :sk',
        ExpressionAttributeValues: { ':sk': 'CURRENT' }
      }));

      const alerts = (result.Items || []).filter(item => 
        item.current_stock <= item.reorder_point
      ).map(item => ({
        product_id: item.product_id,
        current_stock: item.current_stock,
        reorder_point: item.reorder_point,
        alert_type: 'LOW_STOCK',
        severity: item.current_stock === 0 ? 'CRITICAL' : 'WARNING',
        message: \`Product \${item.product_id} is \${item.current_stock === 0 ? 'out of stock' : 'below reorder point'}\`
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ alerts })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};`),
      environment: {
        INVENTORY_TABLE: inventoryTable.tableName
      },
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30)
    });

    // API Gateway
    const api = new apigateway.RestApi(this, `InventoryAPI${suffix}`, {
      restApiName: `inventory-forecasting-api-${suffix}`,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
      }
    });

    // API Resources
    const apiResource = api.root.addResource('api');
    
    const productsResource = apiResource.addResource('products');
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(productsFunction));
    productsResource.addMethod('POST', new apigateway.LambdaIntegration(productsFunction));

    const salesResource = apiResource.addResource('sales');
    const salesUploadResource = salesResource.addResource('upload');
    salesUploadResource.addMethod('POST', new apigateway.LambdaIntegration(salesFunction));
    
    const salesProductResource = salesResource.addResource('{product_id}');
    salesProductResource.addMethod('GET', new apigateway.LambdaIntegration(salesFunction));

    const forecastsResource = apiResource.addResource('forecasts');
    const forecastsGenerateResource = forecastsResource.addResource('generate');
    forecastsGenerateResource.addMethod('POST', new apigateway.LambdaIntegration(forecastFunction));
    
    const forecastsProductResource = forecastsResource.addResource('{product_id}');
    forecastsProductResource.addMethod('GET', new apigateway.LambdaIntegration(forecastFunction));

    const inventoryResource = apiResource.addResource('inventory');
    inventoryResource.addMethod('GET', new apigateway.LambdaIntegration(inventoryFunction));
    
    const inventoryProductResource = inventoryResource.addResource('{product_id}');
    inventoryProductResource.addMethod('PUT', new apigateway.LambdaIntegration(inventoryFunction));
    
    const inventoryAlertsResource = inventoryResource.addResource('alerts');
    inventoryAlertsResource.addMethod('GET', new apigateway.LambdaIntegration(inventoryFunction));

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL'
    });

    new cdk.CfnOutput(this, 'UploadBucketName', {
      value: uploadBucket.bucketName,
      description: 'S3 Upload Bucket Name'
    });
  }
}
