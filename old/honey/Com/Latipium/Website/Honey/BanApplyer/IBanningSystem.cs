// IBanningSystem.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;

namespace Com.Latipium.Website.Honey.BanApplyer {
	public interface IBanningSystem {
		void Ban(string IP);

		void LiftBan(string IP);

		void Reset();
	}
}

