// AbstractHoneyProtocol.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Net.Sockets;

namespace Com.Latipium.Website.Honey {
	public abstract class AbstractHoneyProtocol : IHoneyProtocol {
		public int Port {
			get;
			set;
		}

		public string Name {
			get;
			set;
		}

		public abstract void Handle(string message, TcpClient client);

		protected AbstractHoneyProtocol(int port, string name) {
			Port = port;
			Name = name;
		}
	}
}

