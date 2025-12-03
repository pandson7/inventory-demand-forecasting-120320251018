#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InventoryForecastingStack120320251018 } from '../lib/inventory-forecasting-stack';

const app = new cdk.App();
new InventoryForecastingStack120320251018(app, 'InventoryForecastingStack120320251018', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});
