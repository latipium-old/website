// ProtocolManipulations.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Com.Latipium.Website.Honey.Linq {
	public static class ProtocolManipulations {
		public static IEnumerable<string> LinesOfLength(this string text, int length) {
			return new SplitLineEnumerator(text, length);
		}

		public static IEnumerable<string> Prepend(this IEnumerable<string> e, string str) {
			return e.Select(
				s => string.Concat(str, s));
		}

		public static IEnumerable<string> Append(this IEnumerable<string> e, string str) {
			return e.Select(
				s => string.Concat(s, str));
		}

		public static IEnumerable<string> PadRight(this IEnumerable<string> e, int totalWidth) {
			return e.Select(
				s => s.PadRight(totalWidth));
		}

		public static string ToHumanReadableString(this TimeSpan s) {
			StringBuilder str = new StringBuilder();
			string pre = "";
			if ( s.Days != 0 ) {
				str.Append(pre);
				str.Append(s.Days);
				str.Append(" day");
				if ( s.Days != 1 ) {
					str.Append("s");
				}
				pre = ", ";
			}
			if ( s.Hours != 0 ) {
				str.Append(pre);
				str.Append(s.Hours);
				str.Append(" hour");
				if ( s.Hours != 1 ) {
					str.Append("s");
				}
				pre = ", ";
			}
			if ( s.Minutes != 0 ) {
				str.Append(pre);
				str.Append(s.Minutes);
				str.Append(" minute");
				if ( s.Minutes != 1 ) {
					str.Append("s");
				}
				pre = ", ";
			}
			if ( s.Seconds != 0 ||
				s.Milliseconds != 0 ) {
				str.Append(pre);
				str.Append(s.Seconds);
				if ( s.Milliseconds != 0 ) {
					str.AppendFormat(".{0:F3}", ((float) s.Milliseconds) / 1000f);
				}
				str.Append(" second");
				if ( s.Seconds != 1 ||
					s.Milliseconds != 0 ) {
					str.Append("s");
				}
			}
			string st = str.ToString();
			int i = st.LastIndexOf(',');
			if ( i > 0 ) {
				str.Replace(",", ", and", i - 1, 1);
				st = str.ToString();
			}
			return st;
		}
	}
}

