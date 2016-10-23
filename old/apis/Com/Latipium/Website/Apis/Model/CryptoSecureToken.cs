// CryptoSecureToken.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Security.Cryptography;

namespace Com.Latipium.Website.Apis.Model {
	public class CryptoSecureToken : CryptoInsecureToken {
		private static readonly RandomNumberGenerator CSPRNG = new RNGCryptoServiceProvider();

		protected override void Generate(int length) {
			char[] token = new char[length];
			int i = 0;
			byte[] buffer = new byte[1];
			while ( i < token.Length ) {
				CSPRNG.GetBytes(buffer);
				if ( buffer[0] < Dictionary.Length ) {
					token[i] = Dictionary[buffer[0]];
					++i;
				}
			}
			Value = new string(token);
		}

		public CryptoSecureToken(int length) : base(length) {
		}
	}
}

