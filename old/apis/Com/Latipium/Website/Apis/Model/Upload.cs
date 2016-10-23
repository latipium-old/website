// Upload.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.IO;

namespace Com.Latipium.Website.Apis.Model {
	public class Upload {
		public byte[] Data;

		public Upload() {
		}

		public Upload(byte[] data) {
			Data = data;
		}

		public Upload(Stream stream) {
			using ( MemoryStream mem = new MemoryStream() ) {
				stream.CopyTo(mem);
				Data = mem.ToArray();
			}
		}
	}
}

