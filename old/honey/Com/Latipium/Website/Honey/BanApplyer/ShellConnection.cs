// ShellConnection.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;
#if !DEBUG
using System.Diagnostics;
using System.IO;
#endif
using System.Net;
#if DEBUG
using log4net;
#endif

namespace Com.Latipium.Website.Honey.BanApplyer {
	public class ShellConnection {
#if DEBUG
		private static readonly ILog Log = LogManager.GetLogger(typeof(ShellConnection));
		private readonly string Username;
		private readonly IPAddress Host;
#else
		private readonly ProcessStartInfo StartInfo;
		private readonly object Lock;
		private Process Process;
		private TextWriter Stdin;
		private TextReader Stdout;

		private void LaunchProcess() {
			if ( Process == null || Process.HasExited ) {
				if ( Process != null ) {
					Process.Close();
					Process.Dispose();
				}
				Process = Process.Start(StartInfo);
				Stdin = Process.StandardInput;
				Stdout = Process.StandardOutput;
			}
		}
#endif

		public IEnumerable<string> ExecuteCommand(string cmd) {
#if DEBUG
			Log.InfoFormat("{0}@{1}:~$ {2}", Username, Host, cmd);
			return new string[] {
			};
#else
			lock ( Lock ) {
				LaunchProcess();
				Stdin.WriteLine(cmd);
				string line;
				List<string> lines = new List<string>();
				while ( (line = Stdout.ReadLine()) != "@@EOF@@" ) {
					lines.Add(line);
				}
				return lines;
			}
#endif
		}

		public ShellConnection(string user, IPAddress host) {
#if DEBUG
			Username = user;
			Host = host;
#else
			StartInfo = new ProcessStartInfo();
			StartInfo.RedirectStandardInput = true;
			StartInfo.RedirectStandardOutput = true;
			StartInfo.UseShellExecute = false;
			if ( IPAddress.IsLoopback(host) ) {
				StartInfo.FileName = "/bin/bash";
				StartInfo.Arguments = "-c 'while read line; do bash -c \"$line\"; echo \"@@EOF@@\"; done'";
			} else {
				StartInfo.FileName = "/usr/bin/ssh";
				StartInfo.Arguments = string.Format("{0}@{1} bash -c 'while read line; do bash -c \"$line\"; echo \"@@EOF@@\"; done'", user, host);
			}
			Lock = new object();
#endif
		}
	}
}

