// HttpProtocol.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.IO;
using System.Net.Sockets;

namespace Com.Latipium.Website.Honey.Protocols {
	public class HttpProtocol : AbstractHoneyProtocol {
		private const string Header = "<!DOCTYPE html><html><body><p>";
		private const string Footer = "</p></body></html>\n";

		public override void Handle(string message, TcpClient client) {
			using ( Stream stream = client.GetStream() ) {
				using ( TextWriter writer = new StreamWriter(stream) ) {
					writer.WriteLine("HTTP/1.1 200 OK");
					writer.WriteLine("Content-Type: text/html");
					writer.WriteLine(string.Concat("Content-Length: ", (Header.Length + message.Length + Footer.Length).ToString()));
					writer.WriteLine();
					writer.Write(Header);
					writer.Write(message);
					writer.Write(Footer);
				}
			}
		}

		public HttpProtocol() : base(80, "HTTP") {
		}
	}
}

