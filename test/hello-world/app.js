// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-2'});
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
    //let {email, name, contact, message} = context;
    const params = {
      TableName : 'contact_me',
      /* Item properties will depend on your application concerns */
      Item: {
        contact: '096352521',
         me:'juuds1',
         name: 'hyuwsd',
         email: 'this@that.com',
         
         message: 'test'
      }
    }
    try {
        const ret = await getItem()
        // const ret = await axios(url);
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: ret,
                // location: ret.data.trim()
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};
/*
async function createItem(context){
  let ret;
    const params = {
        TableName : 'contact_me',
        /* Item properties will depend on your application concerns 
        Item: {
          contact: '096352521',
           me:'juuds1',
           name: 'hyuwsd',
           email: 'this@that.com',
           
           message: 'test'
        }
      }
    await docClient.put(params, function(err, data) {
        if (err) {
            ret = "Error";
        } else {
          ret = data;
        }
      });
      return ret;
      /*
    try {
      await docClient.put(params).promise();
    } catch (err) {
      return err;
    }
    
  }

 */
async function createItem(params){
    
      await docClient.put(params).promise();
  }
  async function getItem(){
    const params = {
      TableName: 'contact_me',
      
      Key: {
          contact: '0777777',
          me:'_thisme',
      }
      
    };
    try {
      const data = await docClient.get(params).promise()
      return data
    } catch (err) {
      return err
    }
  }