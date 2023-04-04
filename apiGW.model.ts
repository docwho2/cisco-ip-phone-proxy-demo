export interface APIGatewayProxyEventHeaders {
    [name: string]: string | undefined;
}

export interface APIGatewayProxyEventMultiValueHeaders {
    [name: string]: string[] | undefined;
}

export interface APIGatewayProxyEventPathParameters {
    [name: string]: string | undefined;
}

export interface APIGatewayProxyEventQueryStringParameters {
    [name: string]: string | undefined;
}

export interface APIGatewayProxyEventMultiValueQueryStringParameters {
    [name: string]: string[] | undefined;
}

export interface APIGatewayProxyEventStageVariables {
    [name: string]: string | undefined;
}

/**
 * Works with HTTP API integration Payload Format version 2.0
 * @see - https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html
 */
export interface APIGatewayEventRequestContextV2 {
    accountId: string;
    apiId: string;
    domainName: string;
    domainPrefix: string;
    http: {
        method: string;
        path: string;
        protocol: string;
        sourceIp: string;
        userAgent: string;
    };
    requestId: string;
    routeKey: string;
    stage: string;
    time: string;
    timeEpoch: number;
}

export interface APIGatewayProxyEventV2 {
    body: string | null;
    headers: APIGatewayProxyEventHeaders;
    multiValueHeaders: APIGatewayProxyEventMultiValueHeaders;
    httpMethod: string;
    isBase64Encoded: boolean;
    path: string;
    pathParameters: APIGatewayProxyEventPathParameters | null;
    queryStringParameters: APIGatewayProxyEventQueryStringParameters | null;
    multiValueQueryStringParameters: APIGatewayProxyEventMultiValueQueryStringParameters | null;
    stageVariables: APIGatewayProxyEventStageVariables | null;
    requestContext: APIGatewayEventRequestContextV2;
    resource: string;
}