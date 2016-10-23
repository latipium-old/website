// IpTablesConnection.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;

namespace Com.Latipium.Website.Honey.BanApplyer {
	public class IpTablesConnection : ShellConnection {
		public void ExecuteCommand(string table, string chain, string action, string args = "") {
			ExecuteCommand(string.Format("sudo iptables -t {0} {2} {1} {3}", table, chain, action, args));
		}

		public void ClearChain(string table, string chain) {
			ExecuteCommand(table, chain, "-F");
		}

		public void SetPolicy(string table, string chain, string policy) {
			ExecuteCommand(table, chain, "-P", policy);
		}

		public void AddRule(string table, string chain, string rule) {
			ExecuteCommand(table, chain, "-A", rule);
		}

		public void AddRule(string table, string chain, string rule, params object[] args) {
			AddRule(table, chain, string.Format(rule, args));
		}

		public void DropRule(string table, string chain, int index) {
			ExecuteCommand(table, chain, "-D", index.ToString());
		}

		public IEnumerable<int> GetRules(string table, string chain, string pattern) {
			return ExecuteCommand(string.Format(
				"sudo iptables -t {0} -S {1} | grep -- -A | grep -E -n -- \"-A {1} {2}\" | sed -e \"s|:.*$||\"",
				table, chain, pattern))
					.Select(
						s => int.Parse(s));
		}

		public IEnumerable<int> GetRules(string table, string chain, string pattern, params object[] args) {
			return GetRules(table, chain, string.Format(pattern, args));
		}

		public IpTablesConnection(string user, IPAddress host) : base(user, host) {
		}
	}
}

