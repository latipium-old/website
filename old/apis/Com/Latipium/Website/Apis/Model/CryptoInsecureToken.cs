// CryptoInsecureToken.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Linq;

namespace Com.Latipium.Website.Apis.Model {
	public class CryptoInsecureToken {
		protected static readonly char[] Dictionary = "abcdefghijklmopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".ToCharArray();
		public string Value {
			get;
			protected set;
		}

		public static implicit operator string(CryptoInsecureToken token) {
			return token.ToString();
		}

		public override string ToString() {
			return Value;
		}

		public override bool Equals(object obj) {
			if ( obj is CryptoInsecureToken ) {
				return Value.Equals(((CryptoInsecureToken) obj).Value);
			} else if ( obj is string ) {
				return Value.Equals(obj);
			} else {
				return false;
			}
		}

		public override int GetHashCode() {
			return Value.GetHashCode();
		}

		protected virtual void Generate(int length) {
			Random rng = new Random();
			Value = new byte[length].Select(
				_ => Dictionary[rng.Next(Dictionary.Length)]
			).Aggregate("",
				(a, b) => string.Concat(a, b));
		}

		public CryptoInsecureToken(int length) {
			Generate(length);
		}
	}
}

