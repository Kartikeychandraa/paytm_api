const express = require("express");
const checksum_lib = require('./routes/paytm/checksum/checksum');
var querystring = require('querystring');
const port = 2000;


var app = express();

 app.get('/payment',(req,res)=>{
        let params ={}
        params['MID'] = 'merchant_id',
        params['WEBSITE'] = 'WEBSTAGING',
        params['CHANNEL_ID'] = 'WEB',
        params['INDUSTRY_TYPE_ID'] = 'Retail',
        params['ORDER_ID'] = 'ORD0004',
        params['CUST_ID'] = 'CUST0044',
        params['TXN_AMOUNT'] = '100',
        params['CALLBACK_URL'] = 'http://localhost:'+port+'/callback',
        params['EMAIL'] = 'xyz@gmail.com',
        params['MOBILE_NO'] = '9999999999'

        checksum_lib.genchecksum(params,'merchant key',function(err,checksum){
            let txn_url = "https://securegw-stage.paytm.in/order/process";

            let form_fields = "";
            for(x in params)
            {
                form_fields += "<input type='hidden' name='"+x+"' value='"+params[x]+"'/>"

            }

            form_fields+="<input type='hidden' name='CHECKSUMHASH' value='"+checksum+"' />"

            var html = '<html><body><center><h1>Please wait! Do not refresh the page</h1></center><form method="post" action="'+txn_url+'" name="f1">'+form_fields +'</form><script type="text/javascript">document.f1.submit()</script></body></html>'
            res.writeHead(200,{'Content-Type' : 'text/html'})
            res.write(html)
            res.end()
        })
    })

app.post("/callback",(request,response)=>{
if(request.method == 'POST'){
				var fullBody = '';
				request.on('data', function(chunk) {
					fullBody += chunk.toString();
				});
				request.on('end', function() {
					var decodedBody = querystring.parse(fullBody);
					
					console.log(decodedBody);

					// get received checksum
					var checksum = decodedBody.CHECKSUMHASH;

					// remove this from body, will be passed to function as separate argument
					delete decodedBody.CHECKSUMHASH;

					response.writeHead(200, {'Content-type' : 'text/html','Cache-Control': 'no-cache'});
					if(checksum_lib.verifychecksum(decodedBody,'merchant_key', checksum)) {
						console.log("Checksum Verification => true");
						response.write("Checksum Verification => true");
					}else{
						console.log("Checksum Verification => false");
						response.write("Checksum Verification => false");
					}

					 // if checksum is validated Kindly verify the amount and status 
					 // if transaction is successful 
					 // kindly call Paytm Transaction Status API and verify the transaction amount and status.
					 // If everything is fine then mark that transaction as successful into your DB.			
					
					response.end();
				});


}
});


app.listen(2000);
console.log("Server running on 3000");