// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient({region: 'us-east-2'});
let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    let body;
    let statusCode = 200;
    const headers = {
        'Content-Type': 'application/json',
    };
    
    try {
        switch (event.httpMethod) {
            case 'DELETE':
                body = await deleteItem(JSON.parse(event.body))
                break;
            case 'GET':
                body = event.pathParameters.id;
                break;
            case 'POST':
                body = await createItem(JSON.parse(event.body))
                break;
            case 'PUT':
                body = await updateItem(JSON.parse(event.body))
                break;
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        statusCode = '400';
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }
/*
    try {
        // const ret = await axios(url);
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'hello world',
                // location: ret.data.trim()
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }
*/
    return {
        'statusCode': 200,
        'body': JSON.stringify({
          'message': body
          // location: ret.data.trim()
      }),
        'headers': headers,
    };
};
async function createItem(context){
  let ret;
    const {contact, me,name,email,message} = context;
    const params = {
        TableName : 'contact_me',
        /* Item properties will depend on your application concerns */
        Item: {
          contact: contact,
           me:me,
           name: name,
           email: email,
           
           message: message
        }
      }
      /*
    await ddb.put(params, function(err, data) {
        if (err) {
            ret = "Error";
        } else {
          ret = data;
        }
      });*/
      await ddb.put(params).promise();
  return "saved";

      /*
    try {
      await docClient.put(params).promise();
    } catch (err) {
      return err;
    }
    */
  }
  async function updateItem(context){
    const params = {
        TableName: 'contact_me',
        Key: {
          contact: context.contact,
          me:context.me
        },
        UpdateExpression: 'set #name = :n, message = :m, email= :e',
        ExpressionAttributeNames:{
          "#name": "name"
         },
        ExpressionAttributeValues: {
          ':n' : context.name,
          ':m' : context.message,
          ':e' : context.email
        }
        
      };
    await ddb.update(params).promise();
    return 'saved';
      /*
    try {
      await docClient.put(params).promise();
    } catch (err) {
      return err;
    }
    */
  }

  async function getItem(context){
    let ret;
      const params = {
        TableName: 'contact_me',
        
        Key: {
            contact: '0777777',
            me:'_thisme',
        }
        
      };
      
      ret = await ddb.get(params).promise();
      return ret;
    }
      async function deleteItem(context){
        const params = {
          TableName: 'contact_me',
          Key: {
              contact: context.contact,
              me:context.me,
          }
        };
       await ddb.delete(params).promise();
  return 'deleted';
      /*
    try {
      const data = await docClient.get(params).promise()
      return data
    } catch (err) {
      return err
    }*/
  }
  
  async function listItems(){
    const params = {
  TableName : 'contact_me'
};
  try {
    const data = await ddb.scan(params).promise()
    return data
  } catch (err) {
    return err
  }
}