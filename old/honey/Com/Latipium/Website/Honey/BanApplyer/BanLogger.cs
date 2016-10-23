// BanLogger.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
#if DEBUG
using System;
using log4net;

namespace Com.Latipium.Website.Honey.BanApplyer {
	public class BanLogger : IBanningSystem {
		private static readonly ILog Log = LogManager.GetLogger(typeof(BanLogger));

		public void Ban(string IP) {
			Log.InfoFormat("Banning {0}", IP);
		}

		public void LiftBan(string IP) {
			Log.InfoFormat("Unbanning {0}", IP);
		}

		public void Reset() {
			Log.Info("Clearing bans");
		}
	}
}
#endif

