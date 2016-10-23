// TokenRequest.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.IO;

namespace Com.Latipium.Website.Apis.Cgi {
	public class TokenRequest {
		private static readonly string ClientSecret = File.ReadAllText("/etc/latipium/website/auth/secret").Replace("\n", "");
		public const string ClientID = "303017383010-13dj4r21k7t8nbp2b5sko1h0vtm7d4of.apps.googleusercontent.com";

		public string code;
		public string client_id;
		public string client_secret;
		public string redirect_uri;
		public string grant_type;

		public override string ToString() {
			return string.Concat(
				 "code=", code,
				"&client_id=", client_id,
				"&client_secret=", client_secret,
				"&redirect_uri=", redirect_uri,
				"&grant_type=", grant_type
			);
		}

		public TokenRequest(string code) {
			this.code = code;
			this.client_id = ClientID;
			this.client_secret = ClientSecret;
#if DEBUG
			this.redirect_uri = "http://apis.latipium.com/callback";
#else
			this.redirect_uri = "https://apis.latipium.com/callback";
#endif
			this.grant_type = "authorization_code";
		}
	}
}

