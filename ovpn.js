function isOVPNClientConfig(OVPNFile) {
  OVPNTextArray = OVPNFile.split ("\n");
  OVPNTextArrayLowerCase = OVPNTextArray.map(function(x) { return x.toLowerCase(); });
  if ((OVPNTextArrayLowerCase.indexOf("client") >= 0) || (OVPNTextArrayLowerCase.indexOf("tls-client") >= 0)) {return true}
  else return false;
}