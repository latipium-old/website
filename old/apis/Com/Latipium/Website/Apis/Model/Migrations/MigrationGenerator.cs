// MigrationGenerator.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
using System;
using System.Collections.Generic;
using System.Data.Entity.Migrations;
using System.Data.Entity.Migrations.Design;
using System.IO;
using System.Resources;
using System.Xml;
using LibGit2Sharp;
using log4net;

namespace Com.Latipium.Website.Apis.Model.Migrations {
	public class MigrationGenerator {
		private static readonly ILog Log = LogManager.GetLogger(typeof(MigrationGenerator));
		public static readonly string ProjectPath = Path.Combine("..", "..", "Com.Latipium.Website.Apis.csproj");

		public static string GetGitPath(string dir) {
			string git = Path.Combine(dir, ".git");
			if ( Directory.Exists(git) ) {
				return git;
			} else {
				return GetGitPath(Path.Combine(dir, ".."));
			}
		}

		public static string MigrationFilePath(string commit, string ext) {
			return Path.Combine("..", "..", "Com", "Latipium", "Website", "Apis", "Model", "Migrations", string.Concat("_", commit, ".", ext));
		}

		public static void WriteHeader(TextWriter writer, string path, string commit) {
			writer.WriteLine("// {0}", Path.GetFileName(path));
			writer.WriteLine("//");
			writer.WriteLine("// Copyright (c) 2016 Zach Deibert.");
			writer.WriteLine("// All Rights Reserved.");
			writer.WriteLine("//");
			writer.WriteLine("// This code was auto-generated from commit {0}:", commit);
		}

		public static void WriteSource(string path, string commit, string code) {
			using ( Stream stream = File.OpenWrite(path) ) {
				using ( TextWriter writer = new StreamWriter(stream) ) {
					WriteHeader(writer, path, commit);
					writer.WriteLine(code);
				}
			}
		}

		public static void WriteUserCode(ScaffoldedMigration migration, string commit) {
			string path = MigrationFilePath(commit, "cs");
			Log.InfoFormat("Writing user code to {0}", path);
			WriteSource(path, commit, migration.UserCode);
			Log.Info("User code written");
		}

		public static void WriteDesignerCode(ScaffoldedMigration migration, string commit) {
			string path = MigrationFilePath(commit, "Designer.cs");
			Log.InfoFormat("Writing designer code to {0}", path);
			WriteSource(path, commit, migration.DesignerCode);
			Log.Info("Designer code written");
		}

		public static void WriteCLSCode(ScaffoldedMigration migration, string commit) {
			string path = MigrationFilePath(commit, "cls.cs");
			Log.InfoFormat("Writing CLS Compliance notice to {0}", path);
			using ( Stream stream = File.OpenWrite(path) ) {
				using ( TextWriter writer = new StreamWriter(stream) ) {
					WriteHeader(writer, path, commit);
					writer.WriteLine("using System;");
					writer.WriteLine();
					writer.WriteLine("namespace Com.Latipium.Website.Apis.Model.Migrations {");
					writer.WriteLine("    [CLSCompliant(false)]");
					writer.WriteLine("    public partial class _{0} {1}", commit, '{');
					writer.WriteLine("    }");
					writer.WriteLine("}");
				}
			}
			Log.Info("CLS Compliance notice written");
		}

		public static void WriteResources(ScaffoldedMigration migration, string commit) {
			string path = MigrationFilePath(commit, "resources");
			Log.InfoFormat("Writing resources to {0}", path);
			using ( ResourceWriter writer = new ResourceWriter(path) ) {
				foreach ( KeyValuePair<string, object> resource in migration.Resources ) {
					writer.AddResource(resource.Key, resource.Value);
				}
			}
			Log.Info("Resources written");
		}

		public static XmlNode GetItemGroup(XmlDocument doc, string name) {
			XmlNodeList list = doc.GetElementsByTagName(name);
			if ( list.Count > 0 ) {
				return list.Item(0).ParentNode;
			} else {
				XmlNode itemGroup = doc.CreateElement("ItemGroup", doc.DocumentElement.NamespaceURI);
				doc.DocumentElement.AppendChild(itemGroup);
				return itemGroup;
			}
		}

		public static XmlNode AppendItem(XmlDocument doc, string type, string path) {
			XmlNode itemGroup = GetItemGroup(doc, type);
			XmlNode item = doc.CreateElement(type, doc.DocumentElement.NamespaceURI);
			XmlAttribute attr = doc.CreateAttribute("Include");
			attr.Value = path;
			item.Attributes.Append(attr);
			itemGroup.AppendChild(item);
			Log.InfoFormat("Added {0} to the project", path);
			return item;
		}

		public static void UpdateProject(ScaffoldedMigration migration, string commit) {
			XmlDocument doc = new XmlDocument();
			doc.Load(ProjectPath);
			AppendItem(doc, "Compile", string.Concat("Com\\Latipium\\Website\\Apis\\Model\\Migrations\\_", commit, ".cs"));
			AppendItem(doc, "Compile", string.Concat("Com\\Latipium\\Website\\Apis\\Model\\Migrations\\_", commit, ".Designer.cs"));
			AppendItem(doc, "Compile", string.Concat("Com\\Latipium\\Website\\Apis\\Model\\Migrations\\_", commit, ".cls.cs"));
			XmlNode logicalName = doc.CreateElement("LogicalName", doc.DocumentElement.NamespaceURI);
			logicalName.InnerText = string.Concat("Com.Latipium.Website.Apis.Model.Migrations._", commit, ".resources");
			AppendItem(doc, "EmbeddedResource", string.Concat("Com\\Latipium\\Website\\Apis\\Model\\Migrations\\_", commit, ".resources")).AppendChild(logicalName);
			doc.Save(ProjectPath);
		}

		public static void Main(string[] args) {
			Repository repo = new Repository(GetGitPath("."));
			string commit = repo.Head.Tip.Sha.Substring(0, 8);
			MigrationConfig config = new MigrationConfig();
			MigrationScaffolder scaffoler = new MigrationScaffolder(config);
			ScaffoldedMigration migration = scaffoler.Scaffold(string.Concat("_", commit));
			WriteUserCode(migration, commit);
			WriteDesignerCode(migration, commit);
			WriteCLSCode(migration, commit);
			WriteResources(migration, commit);
			UpdateProject(migration, commit);
		}
	}
}

