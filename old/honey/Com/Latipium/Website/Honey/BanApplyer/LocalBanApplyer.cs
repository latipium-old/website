// LocalBanApplyer.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Net;

namespace Com.Latipium.Website.Honey.BanApplyer {
	public class LocalBanApplyer : IBanningSystem {
		private readonly IpTablesConnection IpTables;

		public void Ban(string IP) {
			IpTables.AddRule("filter", "INPUT", "-s {0} -j DROP", IP);
		}

		public void LiftBan(string IP) {
			foreach ( int rule in IpTables.GetRules("filter", "INPUT", "-s {0}(/32)? -j DROP", IP) ) {
				IpTables.DropRule("filter", "INPUT", rule);
			}
		}

		public void Reset() {
			IpTables.SetPolicy("filter", "INPUT", "ACCEPT");
			IpTables.ClearChain("filter", "INPUT");
		}

		public LocalBanApplyer() {
			IpTables = new IpTablesConnection(Environment.UserName, IPAddress.Loopback);
		}
	}
}

