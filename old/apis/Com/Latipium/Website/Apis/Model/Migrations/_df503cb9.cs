// _df503cb9.cs
//
// Copyright (c) 2016 Zach Deibert.
// All Rights Reserved.
//
// This code was auto-generated from commit df503cb9:
namespace Com.Latipium.Website.Apis.Model.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _df503cb9 : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.CITokens",
                c => new
                    {
                        Id = c.String(nullable: false, maxLength: 128, storeType: "nvarchar"),
                        ModuleId = c.String(maxLength: 128, storeType: "nvarchar"),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Modules", t => t.ModuleId)
                .Index(t => t.ModuleId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.CITokens", "ModuleId", "dbo.Modules");
            DropIndex("dbo.CITokens", new[] { "ModuleId" });
            DropTable("dbo.CITokens");
        }
    }
}

