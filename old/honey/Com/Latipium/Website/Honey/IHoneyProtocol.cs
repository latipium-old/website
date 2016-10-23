// IHoneyProtocol.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Net.Sockets;

namespace Com.Latipium.Website.Honey {
	public interface IHoneyProtocol {
		int Port {
			get;
		}

		string Name {
			get;
		}

		void Handle(string message, TcpClient client);
	}
}

