// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const AWS = require('aws-sdk');
const uuid = require('uuid');
const ddb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

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
        if (event.queryStringParameters === null) {
          body = await listItems();
        }
        else {
          body = await getItem(event.queryStringParameters);
        }
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

  return {
    'statusCode': statusCode,
    'body': JSON.stringify({
      'data': body
      // location: ret.data.trim()
    }),
    'headers': headers,
  };
};
async function createItem(context) {
  const { contact, name, email, message } = context;
  const timestamp = new Date().getTime();
  const params = {
    TableName: 'contact',
    /* Item properties will depend on your application concerns */
    Item: {
      id: uuid.v1(),
      contact: contact,
      createdAt: timestamp,
      name: name,
      email: email,

      message: message
    }
  }

   return await ddb.put(params).promise();



}
async function updateItem(context) {
  const {id, name, message, email, createdAt} = context;
  const timestamp = new Date().getTime();
  const params = {
    TableName: 'contact',
    Key: {
      id: context.id
    },
    UpdateExpression: 'set #name = :n, message = :m, email= :e, updatedAt = :u, createdAt= :c',
    ExpressionAttributeNames: {
      "#name": "name"
    },
    ExpressionAttributeValues: {
      ':n': name,
      ':m': message,
      ':e': email,
      ':u': timestamp,
      ':c': createdAt
    }

  };
  return await ddb.update(params).promise();
  /*
try {
  await docClient.put(params).promise();
} catch (err) {
  return err;
}
*/
}

async function getItem(context) {
  let ret;
  const { id } = context
  const params = {
    TableName: 'contact',

    Key: {
      id: id,

    }

  };

  ret = await ddb.get(params).promise();
  return ret;
}
async function deleteItem(context) {
  const { id } = context;
  const params = {
    TableName: 'contact',
    Key: {
      id: id
    }
  };
  return await ddb.delete(params).promise().then(res => {
    return "item not present"
  });


}

async function listItems() {
  const params = {
    TableName: 'contact'
  };

  return await ddb.scan(params).promise().then(res => {
    return res.Items
  })

}