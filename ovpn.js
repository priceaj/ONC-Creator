var ovpn = {};

ovpn.isOVPNClientConfig = function(OVPNFile) {
  OVPNFileArray = OVPNFile.split("\n");
  if ((OVPNFileArray.indexOf("client") >= 0) || (OVPNFileArray.indexOf("tls-client") >= 0)) {return true;}
  else {return false;}
};

ovpn.parseFile =  function(OVPNFileName, OVPNFile){
  var oncTest = undefined;
  //Options
  OVPNFileArray = OVPNFile.split ("\n");
  var OPVNOptionsArray = {};
  for (var item in OVPNFileArray) {
    if (OVPNFileArray[item].indexOf(" ") != -1) {
    property = (OVPNFileArray[item].slice(0,OVPNFileArray[item].indexOf(" "))).trim();
	value = (OVPNFileArray[item].slice(OVPNFileArray[item].indexOf(" "),OVPNFileArray[item].length)).trim();}
	else {
	property = OVPNFileArray[item].trim();
	value = "";}
	if (property.substr(0,1) != "#")
    {OPVNOptionsArray[property] = value;}
  }
  var network = {};
  network.GUID = main.createGuid();
  network.Type = 'VPN';
  network.Name = OVPNFileName;
  onc.setUpAssocArray(network, 'VPN');
  network.VPN.Type = 'OpenVPN';
  onc.setUpAssocArray(network.VPN, 'OpenVPN');
  
  for (var property in OPVNOptionsArray) {
    if (property in ovpn.mapping){
      network = ovpn.mapping[property](OPVNOptionsArray[property],network);
    }
  }

  oncTest = onc.createUpdate(network, 'NetworkConfigurations',oncTest);


  //Certs
  InlineCertsObject = {};
  InlineCertsObject,OVPNFile = ovpn.retreiveInlineCerts(InlineCertsObject,OVPNFile);
  
  for (var certType in InlineCertsObject){
    if (certType == "tls-auth"){
      var search = /-----BEGIN [A-Za-z0-9- ]+-----[a-zA-Z0-9\n]*-----END [A-Za-z0-9- ]+-----/g;
      var tlsauth = InlineCertsObject[certType];
      network.VPN.OpenVPN.TLSAuthContents = search.exec(tlsauth).toString();
    } else {
    var theFile = {};
    theFile.currentTarget = {};
    theFile.currentTarget.fileName = "test.crt";
    theFile.currentTarget.result = InlineCertsObject[certType];
    certDialog.certData = {};
    certDialog.certData.X509 = certDialog.translateCertificatestoX509(theFile);
    // Create a new ONC object.
    var newCert = certDialog.getFromUi();
    newCert.GUID = main.createGuid();

    if (certType == "ca") {
      newCert.Type = "Authority";
      network.VPN.OpenVPN.ServerCARef = newCert.GUID;
      network.VPN.OpenVPN.ClientCertType = "Pattern";
      network.VPN.OpenVPN.ClientCertPattern = {};
      network.VPN.OpenVPN.ClientCertPattern.IssuerCARef = [];
      network.VPN.OpenVPN.ClientCertPattern.IssuerCARef[0] = newCert.GUID;
    }
          oncTest = onc.createUpdate(newCert, 'Certificates', oncTest);
  }}
  
  // Update any new Network settings from certs
  oncTest = onc.createUpdate(network, 'NetworkConfigurations',oncTest);
  
  return oncTest;
};

ovpn.retreiveInlineCerts = function(InlineCerts,OVPNFile){
 
 function readCert(tag,OVPNFile,certObject){
 startTag = "<" + tag + ">";
 endTag = "</" + tag + ">";
 if (OVPNFile.indexOf(startTag) != -1) {
   certObject[tag] = OVPNFile.slice(OVPNFile.indexOf(startTag)+startTag.length,OVPNFile.indexOf(endTag));
   OVPNFile = OVPNFile.slice(0,OVPNFile.indexOf(startTag))+OVPNFile.slice(OVPNFile.indexOf(endTag)+endTag.length,OVPNFile.length);
   return certObject,OVPNFile;
 }
 else return certObject,OVPNFile;
 }


  for (var tag in ovpn.certTypes){
     InlineCerts,OVPNFile = readCert(ovpn.certTypes[tag],OVPNFile,InlineCerts);
  }
  
 return InlineCerts,OVPNFile;
 };

ovpn.mapping = {
  "remote" : function(option,network){
               network.VPN.Host = (option.split(" "))[0];
               if (network.VPN.OpenVPN.Port === undefined) {network.VPN.OpenVPN.Port = parseInt((option.split(" "))[1],10);}
               if (network.VPN.OpenVPN.Proto === undefined) {network.VPN.OpenVPN.Proto = (option.split(" "))[2];}
             return network;},
  "proto" : function(option,network){network.VPN.OpenVPN.Proto = option; return network;},
  "auth" : function(option,network){network.VPN.OpenVPN.Auth = option; return network;},
  "cipher" : function(option,network){network.VPN.OpenVPN.Cipher = option; return network;},
  "key-direction" : function(option,network){network.VPN.OpenVPN.KeyDirection = option; return network;},
  "remote-cert-tls" : function(option,network){network.VPN.OpenVPN.RemoteCertTLS = option; return network;},
  "comp-lzo" : function(option,network){if (option !== ""){network.VPN.OpenVPN.CompLZO = option;} return network;},
  "verb" : function(option,network){network.VPN.OpenVPN.Verb = option; return network;},
  "reneg-sec" : function(option,network){network.VPN.OpenVPN.RenegSec = parseInt(option,10); return network;}
};

ovpn.certTypes = {
             ca : "ca",
           cert : "cert",
    //         dh : "dh",
    // extraCerts : "extra-certs",
 //           key : "key",
         pkcs12 : "pkcs12",
    //     secret : "secret",
        tlsAuth : "tls-auth"
};

