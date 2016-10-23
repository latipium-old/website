// TelnetProtocol.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.IO;
using System.Net.Sockets;
using Com.Latipium.Website.Honey.Linq;

namespace Com.Latipium.Website.Honey.Protocols {
	public class TelnetProtocol : AbstractHoneyProtocol {
		private const int MaxLineLength = 80;
		private static readonly string Sides = string.Concat("#", new string('=', MaxLineLength - 2), "#");

		public override void Handle(string message, TcpClient client) {
			using ( Stream stream = client.GetStream() ) {
				using ( TextWriter writer = new StreamWriter(stream) ) {
					writer.NewLine = "\r\n";
					writer.WriteLine(Sides);
					foreach ( string line in message.LinesOfLength(MaxLineLength - 4)
						.PadRight(MaxLineLength - 4)
						.Prepend("| ")
						.Append(" |") ) {
						writer.WriteLine(line);
					}
					writer.WriteLine(Sides);
				}
			}
		}

		public TelnetProtocol() : base(23, "telnet") {
		}
	}
}

