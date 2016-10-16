var ovpn = {};

ovpn.isOVPNClientConfig = function(OVPNFile) {
  OVPNFileArray = OVPNFile.split("\n");
  if ((OVPNFileArray.indexOf("client") >= 0) || (OVPNFileArray.indexOf("tls-client") >= 0)) {return true;}
  else {return false;};
};

ovpn.parseFile =  function(OVPNFile){
  //Certs
  var InlineCertsObject,OVPNFile = ovpn.retreiveInlineCerts(OVPNFile);
  //for all certs create a new cert object
  // var oncCert = {};
  // if ('oncBase' in certDialog)
  //   oncCert = certDialog.oncBase;
  // onc.setUpArray(oncCert, 'Trust');
  // onc.setBitArray(oncCert.Trust, 'Web', $('#web-trust').is(':checked'));
  // oncCert.GUID = $('#cert-guid').val();
  // oncCert.Type = $('#cert-type').val();
  // if ('X509' in certDialog.certData)
  //   oncCert.X509 = certDialog.certData.X509;
  // return oncCert;
  var certificates = [];
  
  for (var property in InlineCertsObject){
    
  };
  
  function createCertificate(certficates){
  var certificate = {};
  certificate.GUID = main.createGuid();
  return certificates.push.certificate};
  
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
	if (!(property.substr(0,1) == "#"))
    {OPVNOptionsArray[property] = value;}
  }
  var oncFile = undefined;
  var network = {};
  network.GUID = main.createGuid();
  network.Type = 'VPN';
  network.Name = 'test';
  onc.setUpAssocArray(network, 'VPN');
  network.VPN.Type = 'OpenVPN';
  onc.setUpAssocArray(network.VPN, 'OpenVPN');
  
  for (var property in OPVNOptionsArray) {
    if (property in ovpn.mapping){
      certificates,network = ovpn.mapping[property](OPVNOptionsArray[property],certificates,network);
    }
  }
  var oncTest = onc.createUpdate(certificates, 'Certificates');
  return oncTest = onc.createUpdate(network, 'NetworkConfigurations');
};

ovpn.retreiveInlineCerts = function(OVPNFile){
 var InlineCerts = {};
 
 function readCert(OVPNFile,tag){
 var cert = "";
 startTag = "<" + tag + ">";
 endTag = "</" + tag + ">";
 if (OVPNFile.indexOf(startTag) != -1) {
   cert = OVPNFile.slice(OVPNFile.indexOf(startTag)+startTag.length,OVPNFile.indexOf(endTag));
   OVPNFile = OVPNFile.slice(0,OVPNFile.indexOf(startTag))+OVPNFile.slice(OVPNFile.indexOf(endTag)+endTag.length,OVPNFile.length)
   return cert,OVPNFile;
 }
 else return "";
 }
 
 InlineCerts["ca"],OVPNFile = readCert(OVPNFile,"ca");
 InlineCerts["cert"],OVPNFile = readCert(OVPNFile,"cert");
 InlineCerts["dh"],OVPNFile = readCert(OVPNFile,"dh");
 InlineCerts["extra-certs"],OVPNFile = readCert(OVPNFile,"extra-certs");
 InlineCerts["key"],OVPNFile = readCert(OVPNFile,"key");
 InlineCerts["pkcs12"],OVPNFile = readCert(OVPNFile,"pkcs12");
 InlineCerts["secret"],OVPNFile = readCert(OVPNFile,"secret");
 InlineCerts["tls-auth"],OVPNFile = readCert(OVPNFile,"tls-auth");
 return InlineCerts,OVPNFile;
 }

ovpn.mapping = {
  "remote" : function(option,certs,network){
               network.VPN.Host = (option.split(" "))[0];
               if (network.VPN.OpenVPN.Port === undefined) {network.VPN.OpenVPN.Port = (option.split(" "))[1]}
               if (network.VPN.OpenVPN.Proto === undefined) {network.VPN.OpenVPN.Proto = (option.split(" "))[2];}
             return certs,network},
  "proto" : function(option,certs,network){network.VPN.OpenVPN.Proto = option; return certs,network},
  "remote-cert-tls" : function(option,certs,network){network.VPN.OpenVPN.RemoteCertTLS = option; return certs,network},
  "comp-lzo" : function(option,certs,network){if (option !== ""){network.VPN.OpenVPN.CompLZO = option;} return certs,network},
  "verb" : function(option,certs,network){network.VPN.OpenVPN.Verb = option; return certs,network},
  "reneg-sec" : function(option,certs,network){network.VPN.OpenVPN.RenegSec = option; return certs,network}
};
