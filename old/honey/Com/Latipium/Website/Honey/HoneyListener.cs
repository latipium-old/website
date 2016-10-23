// HoneyListener.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using Com.Latipium.Website.Honey.Model;

namespace Com.Latipium.Website.Honey {
	public class HoneyListener {
		public const int BasePort = 42000;
		public readonly IHoneyProtocol Protocol;
		public readonly int Port;
		private readonly Protocol ProtocolObj;
		private readonly ConnectionHandler Handler;
		private readonly TcpListener Listener;

		private void AcceptCallback(IAsyncResult iar) {
			Listener.BeginAcceptTcpClient(AcceptCallback, null);
			TcpClient client = Listener.EndAcceptTcpClient(iar);
			EndPoint remote = client.Client.RemoteEndPoint;
			string ip = remote.ToString().Split(':')[0];
			string message = Handler.Handle(ip, ProtocolObj);
			Protocol.Handle(message, client);
			client.Close();
		}

		public HoneyListener(IHoneyProtocol protocol, ConnectionHandler handler, DataContext db) {
			Protocol = protocol;
			Protocol proto;
			if ( (proto = db.Protocols
				.FirstOrDefault(
					p => p.Name == protocol.Name &&
					p.StandardPort == protocol.Port)) == null ) {
				IEnumerable<int> ports = db.Protocols
					.Select(
						p => p.InternalPort);
				proto = new Protocol();
				Port = proto.InternalPort = ports.Count() > 0 ?
					ports.Max() + 1 : BasePort;
				proto.Name = protocol.Name;
				proto.StandardPort = protocol.Port;
				db.Protocols.Add(proto);
				db.SaveChanges();
			} else {
				Port = proto.InternalPort;
			}
			Handler = handler;
			ProtocolObj = proto;
			Listener = new TcpListener(IPAddress.Any, Port);
			Listener.Start(1);
			Listener.BeginAcceptTcpClient(AcceptCallback, null);
		}
	}
}

