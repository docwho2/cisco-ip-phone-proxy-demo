import builder = require('xmlbuilder2');


/**
 * Soft Keys that are part of any response
 */
export class SoftKeyItem {
    name: string;
    url: string;
    urldown?: string;
    position: string;
}

/**
 * Menu Items
 */
export class MenuItem {
    name: string;
    url: string;
}
       
export enum InputItemType {
  Text = "A",
  Password = "AP",
  TelephoneNumber = "T",
  Numeric = "N",
  Pin = "NP",
  MathExpression = "E",
  UpperCaseText = "U",
  LowerCaseText = "L"
}

export class InputItem {
    name: string;
    param: string;
    type: InputItemType;
    
    constructor(name: string, param: string, type?: InputItemType) {
        this.name = name;
        this.param = param;
        if ( type !== undefined ) {
            this.type = type;
        } else {
            this.type = InputItemType.Text
        }
    }
    
}

export class DirectoryItem {
    name: string;
    phone: string;
}

export class ExecuteItem {
    URL: string;
    Priority: string;
}

export class XMLOptions {
    appid?: string;
    title?: string;
    prompt?: string;
    softkeys?: SoftKeyItem[];
}

/**
 * Common attributes to all XML Elements
 */
export abstract class CiscoXMLRoot {
    protected name: string;
    protected appid?: string;
    protected title?: string;
    protected prompt?: string;
    protected softkeys?: SoftKeyItem[];

    constructor(options: XMLOptions) {
      if ( options.appid !== undefined ) {
        this.appid = options.appid;
      }
      if (options.title !== undefined ) {
        this.title = options.title;
      }
      if ( options.prompt) {
        this.prompt = options.prompt;
      }
      if ( options.softkeys !== undefined ) {
        this.softkeys = options.softkeys;
      }
    }


abstract toXML(): string;

protected _toXML() {
  const xml_root = builder.create({ version: '1.0', encoding: 'ISO-8859-1'});
  
  const xml = xml_root.ele(this.name).att('appId', this.appid );

  if (this.title) {
    xml.ele('Title').txt(this.title);
  }
  if (this.prompt) {
    xml.ele('Prompt').txt(this.prompt);
  }
  if ( this.softkeys && this.softkeys.length > 0) {
    this.softkeys.forEach(key => {
      const softkey = xml.ele('SoftKeyItem');
      softkey.ele('Name').txt(key.name);
      softkey.ele('URL').txt(key.url);
      if (key.urldown) {
        softkey.ele('URLDown').txt(key.urldown);
      }
      softkey.ele('Position').txt(key.position);
    });
  }

  return (xml);
}
}

export class CiscoIPPhoneMenu extends CiscoXMLRoot {
    private menuitems: MenuItem[];
    constructor(options: XMLOptions, menuOptions: MenuItem[]) {
      super(options);
      this.name = 'CiscoIPPhoneMenu';
      this.menuitems = menuOptions;
    }

    toXML() {
      const xml_root = super._toXML();
      this.menuitems.forEach(mitem => {
        const item = xml_root.ele('MenuItem');
        item.ele('Name').txt(mitem.name);
        item.ele('URL').txt(mitem.url);
      });

      return xml_root.end();
    }
}

export class CiscoIPPhoneText extends CiscoXMLRoot {
    private text: string;
    constructor(options: XMLOptions, text: string) {
      super(options);
      this.name = 'CiscoIPPhoneText';
      this.text = text;
    }

    toXML() {
      const xml_root = super._toXML();
      xml_root.ele('Text').txt(this.text);
      return xml_root.end();
    }
}


/*
 URL: The URL the phone will visit when the user enters the value(s) asked for
   fields: An array of objects with the following properties:
   name: The name of the field asked for
   param: The name of the HTTP GET parameter passed to the URL when done
   type: Field type - A for ascii text; T for a telephone number; 
       N for a numeric value; E for a mathematical expression; 
       U for uppercase text; L for lowercase text. Add a "P" to the type 
       to make it a password (phone will obscure entry)
*/
export class CiscoIPPhoneInput extends CiscoXMLRoot {
    private url: string;
    private inputitems: InputItem[];
    constructor(options: XMLOptions, url: string, items: InputItem[]) {
      super(options);
      this.name = 'CiscoIPPhoneInput';
      this.url = url;
      this.inputitems = items;
    }

    toXML() {
      const xml_root = super._toXML();
      this.inputitems.forEach(inputitem => {
        const item = xml_root.ele('InputItem');
        item.ele('DisplayName').txt(inputitem.name);
        item.ele('QueryStringParam').txt(inputitem.param);
        item.ele('InputFlags').txt(inputitem.type);
      });
      xml_root.ele('URL').txt(this.url);
      return xml_root.end();
    }
}

export class CiscoIPPhoneDirectory extends CiscoXMLRoot {
    private entries: DirectoryItem[];
    constructor(options: XMLOptions, entries: DirectoryItem[]) {
      super(options);
      this.name = 'CiscoIPPhoneDirectory';
      this.entries = entries;
    }

    toXML() {
      const xml_root = super._toXML();
      this.entries.forEach(entry => {
        const item = xml_root.ele('DirectoryEntry');
        item.ele('Name').txt(entry.name);
        item.ele('Telephone').txt(entry.phone);
      });
      return xml_root.end();
    }

}

/**  Builds a CiscoUIPPhoneExecute payload
  // This is used to execute arbitrary commands on the phone
  // commands: an object, each property being a command (URL), and each key
  //   being the "priority" of the command, as follows:
  //     0: Execute immediatly
  //     1: Queue - delay execution until phone is idle
  //     2: Execute only if phone is idle
  **/
export class CiscoIPPhoneExecute extends CiscoXMLRoot {
    commands: ExecuteItem[];
    constructor(commands: ExecuteItem[]) {
      super({});
      this.commands = commands;
    }

    toXML() {
      const xml_root = builder.create({ version: '1.0', encoding: 'ISO-8859-1'});
      const ex = xml_root.ele('CiscoIPPhoneExecute');
      this.commands.forEach(command => {
        ex.ele('ExecuteItem', { URL: command.URL, Priority: command.Priority });
      });
      return xml_root.end();
    }
}
