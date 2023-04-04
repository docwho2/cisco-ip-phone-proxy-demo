import { APIGatewayProxyEventV2 } from './apiGW.model';
import { CiscoIPPhoneInput, CiscoIPPhoneText, InputItem, InputItemType, CiscoXMLRoot } from './phoneXML.model';

/**
 *  Simple 
 */
export const lambdaHandler = async (api_gw_event: APIGatewayProxyEventV2): Promise<XMLResponse> => {
    console.log(JSON.stringify(api_gw_event));


    // Incoming event wrapped with PoxyEvent
    let event = new ProxyEvent(api_gw_event);
    const operation: PathOperation = event.getOperation();

    console.log(`Path is ${operation}`);

    try {
        let xml: CiscoXMLRoot;
        switch (operation) {
            case PathOperation.init:
                xml = new CiscoIPPhoneInput({ title: 'Login Demo' }, event.selfURL("login").href, [
                    new InputItem("Username", "username"),
                    new InputItem("Password", "password", InputItemType.Password),
                    new InputItem("PhoneNumnber", "phone", InputItemType.TelephoneNumber),
                ]);
                break;
            case PathOperation.login:
                xml = new CiscoIPPhoneText({ title: 'Login Demo Result' }, "You are now logged in");
                break;
            case PathOperation.unknown:
            default:
                xml = new CiscoIPPhoneText({ title: 'Unknown Operation' }, "Unknown Operation");
        }

        return new XMLResponse(xml);
    } catch (err) {
        console.log(err);
        return new ErrorResponse(err);
    }
};

enum PathOperation {
    init = 'init',
    login = 'login',
    unknown = 'unknown'
}

class ProxyEvent {
    event: APIGatewayProxyEventV2;

    constructor(event: APIGatewayProxyEventV2) {
        this.event = event;
    }

    /**
     *  Event from CF template uses /{operation}
     * @returns logical operation to perform
     */
    getOperation(): PathOperation {
        if (this.event.pathParameters?.['operation']) {
            const op: string = <string>this.event.pathParameters?.['operation'];
            const pathOp: PathOperation = PathOperation[op];
            return pathOp ?? PathOperation.unknown
        }
        // No op indicates root path, so that is init
        return PathOperation.init;
    }

    selfURL(path?: string): URL {
        let proto: string = this.event?.headers?.['x-forwarded-proto'] || this.event?.headers?.['X-Forwarded-Proto'] || "https";
        console.log(`Proto is ${proto}`);

        let host: string;
        if (proto === "http") {
            // This is local testing in a container, will use Host header for IP and Port
            host = this.event?.headers?.['host'] || this.event?.headers?.['Host'] || "127.0.0.1:3000";
        } else {
            // Https is in the cloud (since http is not supported in API-GW)
            host = this.event?.headers?.['x-forwarded-for'] || this.event.requestContext.domainName;
        }

        let url: URL = new URL(`http://${host}/${path || ""}`);

        // Add back all the original query params
        let qsp = this.event.queryStringParameters;
        if (qsp) {
            for (var qs in qsp) {
                url.searchParams.append(qs, qsp[qs] || "");
            }
        }

        return url;
    }
}


class XMLResponse {
    statusCode: number = 200;
    body: string = "";
    headers: { [header: string]: boolean | number | string; } = {
        "content-type": "text/xml; charset=ISO-8859-1"
    };
    isBase64Encoded?: boolean = false;

    constructor(xml?: CiscoXMLRoot) {
        if (xml !== undefined)
            this.body = xml.toXML();
    }
}

class ErrorResponse extends XMLResponse {
    constructor(error: any) {
        let message;
        if (error instanceof Error) message = error.message
        else message = String(error);
        super(new CiscoIPPhoneText({ title: 'Backend System Error', prompt: 'Please try again' }, message));
    }
}


