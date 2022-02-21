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
                body = deleteItem(context)
                break;
            case 'GET':
                body = getItem(context)
                break;
            case 'POST':
                body = createItem(context)
                break;
            case 'PUT':
                body = updateItem(context)
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
        statusCode,
        ret,
        headers,
    };
};
function createItem(context){
    const params = {
        TableName : 'contact_me',
        /* Item properties will depend on your application concerns */
        Item: {
          contact: context.contact,
           me:context.me,
           name: context.name,
           email: context.email,
           
           message: context.message
        }
      }
    ddb.put(params, function(err, data) {
        if (err) {
            return "Error", err;
        } else {
          return "Success", data;
        }
      });
      /*
    try {
      await docClient.put(params).promise();
    } catch (err) {
      return err;
    }
    */
  }
  function updateItem(context){
    const params = {
        TableName: 'contact_me',
        Key: {
          contact: context.contact,
          me:context.me
        },
        UpdateExpression: 'set name = :n, message = :m',
        ExpressionAttributeValues: {
          ':n' : context.name,
          ':m' : context.message
        }
      };
    ddb.update(params, function(err, data) {
        if (err) {
            return "Error", err;
        } else {
          return "Success", data;
        }
      });
      /*
    try {
      await docClient.put(params).promise();
    } catch (err) {
      return err;
    }
    */
  }

  function getItem(context){
      const params = {
        TableName: 'contact_me',
        Key: {
            contact: context.contact,
            me:context.me,
        }
      };
      ddb.get(params, function(err, data) {
        if (err) {
          return "Error", err;
        } else {
          return "Success", data.Item;
        }
      });
    }
      function deleteItem(context){
        const params = {
          TableName: 'contact_me',
          Key: {
              contact: context.contact,
              me:context.me,
          }
        };
        ddb.delete(params, function(err, data) {
          if (err) {
            return "Error", err;
          } else {
            return "Success", data.Item;
          }
        });
      /*
    try {
      const data = await docClient.get(params).promise()
      return data
    } catch (err) {
      return err
    }*/
  }