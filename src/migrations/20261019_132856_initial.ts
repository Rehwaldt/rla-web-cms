import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum_projects_blocks_image_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum_projects_blocks_image_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum_projects_blocks_text_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin', 'separator');
  CREATE TYPE "public"."enum_projects_blocks_text_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum_projects_blocks_news_reference_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum_projects_blocks_news_reference_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum_projects_blocks_topic_reference_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum_projects_blocks_topic_reference_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum_projects_links_kind" AS ENUM('project', 'external');
  CREATE TYPE "public"."enum_projects_visible_in" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum_projects_type" AS ENUM('competition', 'object', 'concept');
  CREATE TYPE "public"."enum_projects_country" AS ENUM('AT', 'CN', 'CZ', 'FI', 'FR', 'DE', 'NO', 'PL', 'KR', 'CH');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_blocks_image_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum__projects_v_blocks_image_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum__projects_v_blocks_text_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin', 'separator');
  CREATE TYPE "public"."enum__projects_v_blocks_text_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum__projects_v_blocks_news_reference_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum__projects_v_blocks_news_reference_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum__projects_v_blocks_topic_reference_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum__projects_v_blocks_topic_reference_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum__projects_v_version_links_kind" AS ENUM('project', 'external');
  CREATE TYPE "public"."enum__projects_v_version_visible_in" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum__projects_v_version_type" AS ENUM('competition', 'object', 'concept');
  CREATE TYPE "public"."enum__projects_v_version_country" AS ENUM('AT', 'CN', 'CZ', 'FI', 'FR', 'DE', 'NO', 'PL', 'KR', 'CH');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_published_locale" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum_project_categories_menu_column" AS ENUM('1', '2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_image_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum_pages_blocks_image_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum_pages_blocks_text_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin', 'separator');
  CREATE TYPE "public"."enum_pages_blocks_text_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum_pages_blocks_news_reference_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum_pages_blocks_news_reference_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum_pages_blocks_topic_reference_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum_pages_blocks_topic_reference_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_image_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum__pages_v_blocks_image_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_text_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin', 'separator');
  CREATE TYPE "public"."enum__pages_v_blocks_text_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_news_reference_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum__pages_v_blocks_news_reference_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_topic_reference_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum__pages_v_blocks_topic_reference_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum_news_links_kind" AS ENUM('project', 'external');
  CREATE TYPE "public"."enum_news_visible_in" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum_news_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__news_v_version_links_kind" AS ENUM('project', 'external');
  CREATE TYPE "public"."enum__news_v_version_visible_in" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum__news_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__news_v_published_locale" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum_topics_blocks_image_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum_topics_blocks_image_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum_topics_blocks_text_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin', 'separator');
  CREATE TYPE "public"."enum_topics_blocks_text_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum_topics_blocks_news_reference_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum_topics_blocks_news_reference_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum_topics_blocks_topic_reference_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum_topics_blocks_topic_reference_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum_topics_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__topics_v_blocks_image_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum__topics_v_blocks_image_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum__topics_v_blocks_text_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin', 'separator');
  CREATE TYPE "public"."enum__topics_v_blocks_text_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum__topics_v_blocks_news_reference_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum__topics_v_blocks_news_reference_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum__topics_v_blocks_topic_reference_modifiers" AS ENUM('clear', 'right', 'center', 'crop', 'topmargin');
  CREATE TYPE "public"."enum__topics_v_blocks_topic_reference_size" AS ENUM('one6', 'one4', 'one3', 'one2', 'two3', 'full');
  CREATE TYPE "public"."enum__topics_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__topics_v_published_locale" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum_awards_links_kind" AS ENUM('project', 'external');
  CREATE TYPE "public"."enum_awards_visible_in" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum_awards_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__awards_v_version_links_kind" AS ENUM('project', 'external');
  CREATE TYPE "public"."enum__awards_v_version_visible_in" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum__awards_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__awards_v_published_locale" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum_publications_visible_in" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum_publications_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__publications_v_version_visible_in" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum__publications_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__publications_v_published_locale" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum_employees_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__employees_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__employees_v_published_locale" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum_offices_address_country" AS ENUM('AT', 'CN', 'CZ', 'FI', 'FR', 'DE', 'NO', 'PL', 'KR', 'CH');
  CREATE TYPE "public"."enum_jobs_visible_in" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum_jobs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__jobs_v_version_visible_in" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum__jobs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__jobs_v_published_locale" AS ENUM('de', 'en', 'zh', 'cs');
  CREATE TYPE "public"."enum_mines_site_type" AS ENUM('open_cast', 'external_dump', 'underground', 'quarry', 'mountaintop_removal');
  CREATE TYPE "public"."enum_mines_extracted_materials" AS ENUM('coal', 'iron', 'bauxite', 'copper', 'gold', 'lithium', 'nickel', 'phosphorite', 'silver', 'zinc');
  CREATE TYPE "public"."enum_mines_status" AS ENUM('in_use', 'in_revitalization', 'revitalized');
  CREATE TYPE "public"."enum_mine_features_color" AS ENUM('blue', 'green', 'grey');
  CREATE TABLE "projects_blocks_image_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_projects_blocks_image_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "projects_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"size" "enum_projects_blocks_image_size" DEFAULT 'one3',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_text_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_projects_blocks_text_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "projects_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_projects_blocks_text_size" DEFAULT 'one2',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_text_locales" (
  	"title" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "projects_blocks_news_reference_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_projects_blocks_news_reference_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "projects_blocks_news_reference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"news_id" integer,
  	"size" "enum_projects_blocks_news_reference_size" DEFAULT 'one3',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_blocks_topic_reference_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_projects_blocks_topic_reference_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "projects_blocks_topic_reference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"topic_id" integer,
  	"size" "enum_projects_blocks_topic_reference_size" DEFAULT 'one3',
  	"block_name" varchar
  );
  
  CREATE TABLE "projects_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_projects_links_kind" DEFAULT 'external',
  	"label" varchar,
  	"project_id" integer,
  	"url" varchar
  );
  
  CREATE TABLE "projects_visible_in" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_projects_visible_in",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar,
  	"type" "enum_projects_type",
  	"ongoing" boolean,
  	"completion_year" numeric,
  	"country" "enum_projects_country",
  	"area" numeric,
  	"competition_year" numeric,
  	"competition_prize" numeric,
  	"competition_purchased" boolean,
  	"hero_image_id" integer,
  	"preview_image_id" integer,
  	"dark_controls" boolean,
  	"legacy_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_locales" (
  	"name" varchar,
  	"code_and_name" varchar,
  	"motto" varchar,
  	"summary" varchar,
  	"description" jsonb,
  	"place" varchar,
  	"region" varchar,
  	"client" varchar,
  	"architect" varchar,
  	"planning_partners" varchar,
  	"additional_info" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"project_categories_id" integer,
  	"projects_id" integer
  );
  
  CREATE TABLE "_projects_v_blocks_image_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__projects_v_blocks_image_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_projects_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"size" "enum__projects_v_blocks_image_size" DEFAULT 'one3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_text_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__projects_v_blocks_text_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_projects_v_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__projects_v_blocks_text_size" DEFAULT 'one2',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_text_locales" (
  	"title" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_blocks_news_reference_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__projects_v_blocks_news_reference_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_projects_v_blocks_news_reference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"news_id" integer,
  	"size" "enum__projects_v_blocks_news_reference_size" DEFAULT 'one3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_blocks_topic_reference_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__projects_v_blocks_topic_reference_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_projects_v_blocks_topic_reference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"topic_id" integer,
  	"size" "enum__projects_v_blocks_topic_reference_size" DEFAULT 'one3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_projects_v_version_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__projects_v_version_links_kind" DEFAULT 'external',
  	"label" varchar,
  	"project_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_visible_in" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__projects_v_version_visible_in",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_code" varchar,
  	"version_type" "enum__projects_v_version_type",
  	"version_ongoing" boolean,
  	"version_completion_year" numeric,
  	"version_country" "enum__projects_v_version_country",
  	"version_area" numeric,
  	"version_competition_year" numeric,
  	"version_competition_prize" numeric,
  	"version_competition_purchased" boolean,
  	"version_hero_image_id" integer,
  	"version_preview_image_id" integer,
  	"version_dark_controls" boolean,
  	"version_legacy_id" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__projects_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_projects_v_locales" (
  	"version_name" varchar,
  	"version_code_and_name" varchar,
  	"version_motto" varchar,
  	"version_summary" varchar,
  	"version_description" jsonb,
  	"version_place" varchar,
  	"version_region" varchar,
  	"version_client" varchar,
  	"version_architect" varchar,
  	"version_planning_partners" varchar,
  	"version_additional_info" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"project_categories_id" integer,
  	"projects_id" integer
  );
  
  CREATE TABLE "project_categories_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "project_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"menu_column" "enum_project_categories_menu_column",
  	"legacy_id" numeric,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "project_categories_locales" (
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"period" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_image_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_image_modifiers",
  	"locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"size" "enum_pages_blocks_image_size" DEFAULT 'one3',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_text_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_text_modifiers",
  	"locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" jsonb,
  	"size" "enum_pages_blocks_text_size" DEFAULT 'one2',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_news_reference_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_news_reference_modifiers",
  	"locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_news_reference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"news_id" integer,
  	"size" "enum_pages_blocks_news_reference_size" DEFAULT 'one3',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_topic_reference_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_topic_reference_modifiers",
  	"locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_topic_reference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"topic_id" integer,
  	"size" "enum_pages_blocks_topic_reference_size" DEFAULT 'one3',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"image_id" integer,
  	"legacy_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_version_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"period" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_image_modifiers",
  	"locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"size" "enum__pages_v_blocks_image_size" DEFAULT 'one3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_text_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_text_modifiers",
  	"locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" jsonb,
  	"size" "enum__pages_v_blocks_text_size" DEFAULT 'one2',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_news_reference_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_news_reference_modifiers",
  	"locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_news_reference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"news_id" integer,
  	"size" "enum__pages_v_blocks_news_reference_size" DEFAULT 'one3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_topic_reference_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_topic_reference_modifiers",
  	"locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_topic_reference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"topic_id" integer,
  	"size" "enum__pages_v_blocks_topic_reference_size" DEFAULT 'one3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_key" varchar,
  	"version_image_id" integer,
  	"version_legacy_id" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "news_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_news_links_kind" DEFAULT 'external',
  	"label" varchar,
  	"project_id" integer,
  	"url" varchar
  );
  
  CREATE TABLE "news_visible_in" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_news_visible_in",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"image_id" integer,
  	"legacy_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_news_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "news_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_news_v_version_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__news_v_version_links_kind" DEFAULT 'external',
  	"label" varchar,
  	"project_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_news_v_version_visible_in" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__news_v_version_visible_in",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_news_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_date" timestamp(3) with time zone,
  	"version_image_id" integer,
  	"version_legacy_id" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__news_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__news_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_news_v_locales" (
  	"version_title" varchar,
  	"version_content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "topics_blocks_image_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_topics_blocks_image_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "topics_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"size" "enum_topics_blocks_image_size" DEFAULT 'one3',
  	"block_name" varchar
  );
  
  CREATE TABLE "topics_blocks_text_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_topics_blocks_text_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "topics_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_topics_blocks_text_size" DEFAULT 'one2',
  	"block_name" varchar
  );
  
  CREATE TABLE "topics_blocks_text_locales" (
  	"title" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "topics_blocks_news_reference_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_topics_blocks_news_reference_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "topics_blocks_news_reference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"news_id" integer,
  	"size" "enum_topics_blocks_news_reference_size" DEFAULT 'one3',
  	"block_name" varchar
  );
  
  CREATE TABLE "topics_blocks_topic_reference_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_topics_blocks_topic_reference_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "topics_blocks_topic_reference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"topic_id" integer,
  	"size" "enum_topics_blocks_topic_reference_size" DEFAULT 'one3',
  	"block_name" varchar
  );
  
  CREATE TABLE "topics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"legacy_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_topics_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "topics_locales" (
  	"name" varchar,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "topics_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer
  );
  
  CREATE TABLE "_topics_v_blocks_image_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__topics_v_blocks_image_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_topics_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"size" "enum__topics_v_blocks_image_size" DEFAULT 'one3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_topics_v_blocks_text_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__topics_v_blocks_text_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_topics_v_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__topics_v_blocks_text_size" DEFAULT 'one2',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_topics_v_blocks_text_locales" (
  	"title" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_topics_v_blocks_news_reference_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__topics_v_blocks_news_reference_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_topics_v_blocks_news_reference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"news_id" integer,
  	"size" "enum__topics_v_blocks_news_reference_size" DEFAULT 'one3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_topics_v_blocks_topic_reference_modifiers" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__topics_v_blocks_topic_reference_modifiers",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_topics_v_blocks_topic_reference" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"topic_id" integer,
  	"size" "enum__topics_v_blocks_topic_reference_size" DEFAULT 'one3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_topics_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_image_id" integer,
  	"version_legacy_id" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__topics_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__topics_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_topics_v_locales" (
  	"version_name" varchar,
  	"version_description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_topics_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer
  );
  
  CREATE TABLE "awards_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_awards_links_kind" DEFAULT 'external',
  	"label" varchar,
  	"project_id" integer,
  	"url" varchar
  );
  
  CREATE TABLE "awards_visible_in" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_awards_visible_in",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "awards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" numeric,
  	"month" numeric,
  	"image_id" integer,
  	"legacy_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_awards_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "awards_locales" (
  	"name" varchar,
  	"issuer" varchar,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_awards_v_version_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__awards_v_version_links_kind" DEFAULT 'external',
  	"label" varchar,
  	"project_id" integer,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_awards_v_version_visible_in" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__awards_v_version_visible_in",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_awards_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_year" numeric,
  	"version_month" numeric,
  	"version_image_id" integer,
  	"version_legacy_id" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__awards_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__awards_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_awards_v_locales" (
  	"version_name" varchar,
  	"version_issuer" varchar,
  	"version_description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "publications_visible_in" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_publications_visible_in",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "publications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category_id" integer,
  	"year" numeric,
  	"month" numeric,
  	"pages" varchar,
  	"image_id" integer,
  	"file_id" integer,
  	"url" varchar,
  	"legacy_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_publications_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "publications_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"authors" varchar,
  	"journal" varchar,
  	"book_title" varchar,
  	"book_subtitle" varchar,
  	"editors" varchar,
  	"publisher" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "publications_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer
  );
  
  CREATE TABLE "_publications_v_version_visible_in" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__publications_v_version_visible_in",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_publications_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_category_id" integer,
  	"version_year" numeric,
  	"version_month" numeric,
  	"version_pages" varchar,
  	"version_image_id" integer,
  	"version_file_id" integer,
  	"version_url" varchar,
  	"version_legacy_id" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__publications_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__publications_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_publications_v_locales" (
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_authors" varchar,
  	"version_journal" varchar,
  	"version_book_title" varchar,
  	"version_book_subtitle" varchar,
  	"version_editors" varchar,
  	"version_publisher" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_publications_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer
  );
  
  CREATE TABLE "publication_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"legacy_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "publication_categories_locales" (
  	"name" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "employees" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"academic_title" varchar,
  	"office_id" integer,
  	"joined_year" numeric,
  	"email" varchar,
  	"phone" varchar,
  	"portrait_id" integer,
  	"legacy_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_employees_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "employees_locales" (
  	"first_name" varchar,
  	"last_name" varchar,
  	"full_name" varchar,
  	"profession" varchar,
  	"university" varchar,
  	"chamber_membership" varchar,
  	"qualification" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_employees_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_academic_title" varchar,
  	"version_office_id" integer,
  	"version_joined_year" numeric,
  	"version_email" varchar,
  	"version_phone" varchar,
  	"version_portrait_id" integer,
  	"version_legacy_id" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__employees_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__employees_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_employees_v_locales" (
  	"version_first_name" varchar,
  	"version_last_name" varchar,
  	"version_full_name" varchar,
  	"version_profession" varchar,
  	"version_university" varchar,
  	"version_chamber_membership" varchar,
  	"version_qualification" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "offices" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"image_id" integer,
  	"address_street" varchar,
  	"address_postal_code" varchar,
  	"address_country" "enum_offices_address_country",
  	"address_coordinates" geometry(Point),
  	"contact_phone" varchar,
  	"contact_fax" varchar,
  	"contact_email" varchar,
  	"legacy_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "offices_locales" (
  	"name" varchar,
  	"description" jsonb,
  	"address_company" varchar,
  	"address_city" varchar,
  	"contact_note" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "jobs_visible_in" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_jobs_visible_in",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"office_id" integer,
  	"legacy_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_jobs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "jobs_locales" (
  	"title" varchar,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_jobs_v_version_visible_in" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__jobs_v_version_visible_in",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_jobs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_date" timestamp(3) with time zone,
  	"version_office_id" integer,
  	"version_legacy_id" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__jobs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__jobs_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_jobs_v_locales" (
  	"version_title" varchar,
  	"version_description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "mines_site_type" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_mines_site_type",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "mines_extracted_materials" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_mines_extracted_materials",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "mines" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"location" geometry(Point),
  	"status" "enum_mines_status",
  	"closure_year" numeric,
  	"surface_total" numeric,
  	"surface_lake" numeric,
  	"surface_forest" numeric,
  	"surface_agriculture" numeric,
  	"surface_settlement" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "mines_locales" (
  	"title" varchar NOT NULL,
  	"content" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "mines_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"mine_features_id" integer
  );
  
  CREATE TABLE "mine_features" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon_name" varchar,
  	"color" "enum_mine_features_color",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "mine_features_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit" varchar,
  	"project_id" integer,
  	"legacy_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_w480_url" varchar,
  	"sizes_w480_width" numeric,
  	"sizes_w480_height" numeric,
  	"sizes_w480_mime_type" varchar,
  	"sizes_w480_filesize" numeric,
  	"sizes_w480_filename" varchar,
  	"sizes_w768_url" varchar,
  	"sizes_w768_width" numeric,
  	"sizes_w768_height" numeric,
  	"sizes_w768_mime_type" varchar,
  	"sizes_w768_filesize" numeric,
  	"sizes_w768_filename" varchar,
  	"sizes_w992_url" varchar,
  	"sizes_w992_width" numeric,
  	"sizes_w992_height" numeric,
  	"sizes_w992_mime_type" varchar,
  	"sizes_w992_filesize" numeric,
  	"sizes_w992_filename" varchar,
  	"sizes_w1382_url" varchar,
  	"sizes_w1382_width" numeric,
  	"sizes_w1382_height" numeric,
  	"sizes_w1382_mime_type" varchar,
  	"sizes_w1382_filesize" numeric,
  	"sizes_w1382_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer,
  	"project_categories_id" integer,
  	"pages_id" integer,
  	"news_id" integer,
  	"topics_id" integer,
  	"awards_id" integer,
  	"publications_id" integer,
  	"publication_categories_id" integer,
  	"employees_id" integer,
  	"offices_id" integer,
  	"jobs_id" integer,
  	"mines_id" integer,
  	"mine_features_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "project_gallery" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "project_gallery_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"projects_id" integer
  );
  
  ALTER TABLE "projects_blocks_image_modifiers" ADD CONSTRAINT "projects_blocks_image_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects_blocks_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_image" ADD CONSTRAINT "projects_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_image" ADD CONSTRAINT "projects_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_text_modifiers" ADD CONSTRAINT "projects_blocks_text_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_text" ADD CONSTRAINT "projects_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_text_locales" ADD CONSTRAINT "projects_blocks_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_news_reference_modifiers" ADD CONSTRAINT "projects_blocks_news_reference_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects_blocks_news_reference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_news_reference" ADD CONSTRAINT "projects_blocks_news_reference_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_news_reference" ADD CONSTRAINT "projects_blocks_news_reference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_topic_reference_modifiers" ADD CONSTRAINT "projects_blocks_topic_reference_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects_blocks_topic_reference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_blocks_topic_reference" ADD CONSTRAINT "projects_blocks_topic_reference_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_blocks_topic_reference" ADD CONSTRAINT "projects_blocks_topic_reference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_links" ADD CONSTRAINT "projects_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_links" ADD CONSTRAINT "projects_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_visible_in" ADD CONSTRAINT "projects_visible_in_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_preview_image_id_media_id_fk" FOREIGN KEY ("preview_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_project_categories_fk" FOREIGN KEY ("project_categories_id") REFERENCES "public"."project_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_image_modifiers" ADD CONSTRAINT "_projects_v_blocks_image_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v_blocks_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_image" ADD CONSTRAINT "_projects_v_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_image" ADD CONSTRAINT "_projects_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_text_modifiers" ADD CONSTRAINT "_projects_v_blocks_text_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_text" ADD CONSTRAINT "_projects_v_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_text_locales" ADD CONSTRAINT "_projects_v_blocks_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_news_reference_modifiers" ADD CONSTRAINT "_projects_v_blocks_news_reference_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v_blocks_news_reference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_news_reference" ADD CONSTRAINT "_projects_v_blocks_news_reference_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_news_reference" ADD CONSTRAINT "_projects_v_blocks_news_reference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_topic_reference_modifiers" ADD CONSTRAINT "_projects_v_blocks_topic_reference_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v_blocks_topic_reference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_topic_reference" ADD CONSTRAINT "_projects_v_blocks_topic_reference_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_blocks_topic_reference" ADD CONSTRAINT "_projects_v_blocks_topic_reference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_links" ADD CONSTRAINT "_projects_v_version_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_links" ADD CONSTRAINT "_projects_v_version_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_visible_in" ADD CONSTRAINT "_projects_v_version_visible_in_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_preview_image_id_media_id_fk" FOREIGN KEY ("version_preview_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_project_categories_fk" FOREIGN KEY ("project_categories_id") REFERENCES "public"."project_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "project_categories_breadcrumbs" ADD CONSTRAINT "project_categories_breadcrumbs_doc_id_project_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."project_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "project_categories_breadcrumbs" ADD CONSTRAINT "project_categories_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."project_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "project_categories" ADD CONSTRAINT "project_categories_parent_id_project_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."project_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "project_categories_locales" ADD CONSTRAINT "project_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."project_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_timeline" ADD CONSTRAINT "pages_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_modifiers" ADD CONSTRAINT "pages_blocks_image_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_text_modifiers" ADD CONSTRAINT "pages_blocks_text_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_text" ADD CONSTRAINT "pages_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_news_reference_modifiers" ADD CONSTRAINT "pages_blocks_news_reference_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_news_reference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_news_reference" ADD CONSTRAINT "pages_blocks_news_reference_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_news_reference" ADD CONSTRAINT "pages_blocks_news_reference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_topic_reference_modifiers" ADD CONSTRAINT "pages_blocks_topic_reference_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_topic_reference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_topic_reference" ADD CONSTRAINT "pages_blocks_topic_reference_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_topic_reference" ADD CONSTRAINT "pages_blocks_topic_reference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_timeline" ADD CONSTRAINT "_pages_v_version_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_modifiers" ADD CONSTRAINT "_pages_v_blocks_image_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text_modifiers" ADD CONSTRAINT "_pages_v_blocks_text_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text" ADD CONSTRAINT "_pages_v_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_news_reference_modifiers" ADD CONSTRAINT "_pages_v_blocks_news_reference_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_news_reference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_news_reference" ADD CONSTRAINT "_pages_v_blocks_news_reference_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_news_reference" ADD CONSTRAINT "_pages_v_blocks_news_reference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_topic_reference_modifiers" ADD CONSTRAINT "_pages_v_blocks_topic_reference_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_topic_reference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_topic_reference" ADD CONSTRAINT "_pages_v_blocks_topic_reference_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_topic_reference" ADD CONSTRAINT "_pages_v_blocks_topic_reference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_links" ADD CONSTRAINT "news_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_links" ADD CONSTRAINT "news_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news_visible_in" ADD CONSTRAINT "news_visible_in_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "news" ADD CONSTRAINT "news_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "news_locales" ADD CONSTRAINT "news_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_version_links" ADD CONSTRAINT "_news_v_version_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v_version_links" ADD CONSTRAINT "_news_v_version_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v_version_visible_in" ADD CONSTRAINT "_news_v_version_visible_in_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_parent_id_news_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v" ADD CONSTRAINT "_news_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_news_v_locales" ADD CONSTRAINT "_news_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_blocks_image_modifiers" ADD CONSTRAINT "topics_blocks_image_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics_blocks_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_blocks_image" ADD CONSTRAINT "topics_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "topics_blocks_image" ADD CONSTRAINT "topics_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_blocks_text_modifiers" ADD CONSTRAINT "topics_blocks_text_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_blocks_text" ADD CONSTRAINT "topics_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_blocks_text_locales" ADD CONSTRAINT "topics_blocks_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_blocks_news_reference_modifiers" ADD CONSTRAINT "topics_blocks_news_reference_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics_blocks_news_reference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_blocks_news_reference" ADD CONSTRAINT "topics_blocks_news_reference_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "topics_blocks_news_reference" ADD CONSTRAINT "topics_blocks_news_reference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_blocks_topic_reference_modifiers" ADD CONSTRAINT "topics_blocks_topic_reference_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics_blocks_topic_reference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_blocks_topic_reference" ADD CONSTRAINT "topics_blocks_topic_reference_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "topics_blocks_topic_reference" ADD CONSTRAINT "topics_blocks_topic_reference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics" ADD CONSTRAINT "topics_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "topics_locales" ADD CONSTRAINT "topics_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_rels" ADD CONSTRAINT "topics_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_rels" ADD CONSTRAINT "topics_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_blocks_image_modifiers" ADD CONSTRAINT "_topics_v_blocks_image_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_topics_v_blocks_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_blocks_image" ADD CONSTRAINT "_topics_v_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v_blocks_image" ADD CONSTRAINT "_topics_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_blocks_text_modifiers" ADD CONSTRAINT "_topics_v_blocks_text_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_topics_v_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_blocks_text" ADD CONSTRAINT "_topics_v_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_blocks_text_locales" ADD CONSTRAINT "_topics_v_blocks_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_blocks_news_reference_modifiers" ADD CONSTRAINT "_topics_v_blocks_news_reference_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_topics_v_blocks_news_reference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_blocks_news_reference" ADD CONSTRAINT "_topics_v_blocks_news_reference_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v_blocks_news_reference" ADD CONSTRAINT "_topics_v_blocks_news_reference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_blocks_topic_reference_modifiers" ADD CONSTRAINT "_topics_v_blocks_topic_reference_modifiers_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_topics_v_blocks_topic_reference"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_blocks_topic_reference" ADD CONSTRAINT "_topics_v_blocks_topic_reference_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v_blocks_topic_reference" ADD CONSTRAINT "_topics_v_blocks_topic_reference_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v" ADD CONSTRAINT "_topics_v_parent_id_topics_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v" ADD CONSTRAINT "_topics_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_topics_v_locales" ADD CONSTRAINT "_topics_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_rels" ADD CONSTRAINT "_topics_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_topics_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_topics_v_rels" ADD CONSTRAINT "_topics_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "awards_links" ADD CONSTRAINT "awards_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "awards_links" ADD CONSTRAINT "awards_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "awards_visible_in" ADD CONSTRAINT "awards_visible_in_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "awards" ADD CONSTRAINT "awards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "awards_locales" ADD CONSTRAINT "awards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_awards_v_version_links" ADD CONSTRAINT "_awards_v_version_links_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_awards_v_version_links" ADD CONSTRAINT "_awards_v_version_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_awards_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_awards_v_version_visible_in" ADD CONSTRAINT "_awards_v_version_visible_in_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_awards_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_awards_v" ADD CONSTRAINT "_awards_v_parent_id_awards_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."awards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_awards_v" ADD CONSTRAINT "_awards_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_awards_v_locales" ADD CONSTRAINT "_awards_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_awards_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "publications_visible_in" ADD CONSTRAINT "publications_visible_in_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "publications" ADD CONSTRAINT "publications_category_id_publication_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."publication_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "publications" ADD CONSTRAINT "publications_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "publications" ADD CONSTRAINT "publications_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "publications_locales" ADD CONSTRAINT "publications_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "publications_rels" ADD CONSTRAINT "publications_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "publications_rels" ADD CONSTRAINT "publications_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_publications_v_version_visible_in" ADD CONSTRAINT "_publications_v_version_visible_in_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_publications_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_publications_v" ADD CONSTRAINT "_publications_v_parent_id_publications_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."publications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_publications_v" ADD CONSTRAINT "_publications_v_version_category_id_publication_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."publication_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_publications_v" ADD CONSTRAINT "_publications_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_publications_v" ADD CONSTRAINT "_publications_v_version_file_id_media_id_fk" FOREIGN KEY ("version_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_publications_v_locales" ADD CONSTRAINT "_publications_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_publications_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_publications_v_rels" ADD CONSTRAINT "_publications_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_publications_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_publications_v_rels" ADD CONSTRAINT "_publications_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "publication_categories_locales" ADD CONSTRAINT "publication_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."publication_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "employees" ADD CONSTRAINT "employees_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "employees" ADD CONSTRAINT "employees_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "employees_locales" ADD CONSTRAINT "employees_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_employees_v" ADD CONSTRAINT "_employees_v_parent_id_employees_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_employees_v" ADD CONSTRAINT "_employees_v_version_office_id_offices_id_fk" FOREIGN KEY ("version_office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_employees_v" ADD CONSTRAINT "_employees_v_version_portrait_id_media_id_fk" FOREIGN KEY ("version_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_employees_v_locales" ADD CONSTRAINT "_employees_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_employees_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offices" ADD CONSTRAINT "offices_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offices_locales" ADD CONSTRAINT "offices_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jobs_visible_in" ADD CONSTRAINT "jobs_visible_in_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "jobs" ADD CONSTRAINT "jobs_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "jobs_locales" ADD CONSTRAINT "jobs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_jobs_v_version_visible_in" ADD CONSTRAINT "_jobs_v_version_visible_in_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_jobs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_jobs_v" ADD CONSTRAINT "_jobs_v_parent_id_jobs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v" ADD CONSTRAINT "_jobs_v_version_office_id_offices_id_fk" FOREIGN KEY ("version_office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v_locales" ADD CONSTRAINT "_jobs_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_jobs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mines_site_type" ADD CONSTRAINT "mines_site_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."mines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mines_extracted_materials" ADD CONSTRAINT "mines_extracted_materials_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."mines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mines_locales" ADD CONSTRAINT "mines_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mines_rels" ADD CONSTRAINT "mines_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."mines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mines_rels" ADD CONSTRAINT "mines_rels_mine_features_fk" FOREIGN KEY ("mine_features_id") REFERENCES "public"."mine_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mine_features_locales" ADD CONSTRAINT "mine_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."mine_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_project_categories_fk" FOREIGN KEY ("project_categories_id") REFERENCES "public"."project_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_awards_fk" FOREIGN KEY ("awards_id") REFERENCES "public"."awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_publications_fk" FOREIGN KEY ("publications_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_publication_categories_fk" FOREIGN KEY ("publication_categories_id") REFERENCES "public"."publication_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_employees_fk" FOREIGN KEY ("employees_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_offices_fk" FOREIGN KEY ("offices_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mines_fk" FOREIGN KEY ("mines_id") REFERENCES "public"."mines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mine_features_fk" FOREIGN KEY ("mine_features_id") REFERENCES "public"."mine_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "project_gallery_rels" ADD CONSTRAINT "project_gallery_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."project_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "project_gallery_rels" ADD CONSTRAINT "project_gallery_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_blocks_image_modifiers_order_idx" ON "projects_blocks_image_modifiers" USING btree ("order");
  CREATE INDEX "projects_blocks_image_modifiers_parent_idx" ON "projects_blocks_image_modifiers" USING btree ("parent_id");
  CREATE INDEX "projects_blocks_image_order_idx" ON "projects_blocks_image" USING btree ("_order");
  CREATE INDEX "projects_blocks_image_parent_id_idx" ON "projects_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_image_path_idx" ON "projects_blocks_image" USING btree ("_path");
  CREATE INDEX "projects_blocks_image_image_idx" ON "projects_blocks_image" USING btree ("image_id");
  CREATE INDEX "projects_blocks_text_modifiers_order_idx" ON "projects_blocks_text_modifiers" USING btree ("order");
  CREATE INDEX "projects_blocks_text_modifiers_parent_idx" ON "projects_blocks_text_modifiers" USING btree ("parent_id");
  CREATE INDEX "projects_blocks_text_order_idx" ON "projects_blocks_text" USING btree ("_order");
  CREATE INDEX "projects_blocks_text_parent_id_idx" ON "projects_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_text_path_idx" ON "projects_blocks_text" USING btree ("_path");
  CREATE UNIQUE INDEX "projects_blocks_text_locales_locale_parent_id_unique" ON "projects_blocks_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_blocks_news_reference_modifiers_order_idx" ON "projects_blocks_news_reference_modifiers" USING btree ("order");
  CREATE INDEX "projects_blocks_news_reference_modifiers_parent_idx" ON "projects_blocks_news_reference_modifiers" USING btree ("parent_id");
  CREATE INDEX "projects_blocks_news_reference_order_idx" ON "projects_blocks_news_reference" USING btree ("_order");
  CREATE INDEX "projects_blocks_news_reference_parent_id_idx" ON "projects_blocks_news_reference" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_news_reference_path_idx" ON "projects_blocks_news_reference" USING btree ("_path");
  CREATE INDEX "projects_blocks_news_reference_news_idx" ON "projects_blocks_news_reference" USING btree ("news_id");
  CREATE INDEX "projects_blocks_topic_reference_modifiers_order_idx" ON "projects_blocks_topic_reference_modifiers" USING btree ("order");
  CREATE INDEX "projects_blocks_topic_reference_modifiers_parent_idx" ON "projects_blocks_topic_reference_modifiers" USING btree ("parent_id");
  CREATE INDEX "projects_blocks_topic_reference_order_idx" ON "projects_blocks_topic_reference" USING btree ("_order");
  CREATE INDEX "projects_blocks_topic_reference_parent_id_idx" ON "projects_blocks_topic_reference" USING btree ("_parent_id");
  CREATE INDEX "projects_blocks_topic_reference_path_idx" ON "projects_blocks_topic_reference" USING btree ("_path");
  CREATE INDEX "projects_blocks_topic_reference_topic_idx" ON "projects_blocks_topic_reference" USING btree ("topic_id");
  CREATE INDEX "projects_links_order_idx" ON "projects_links" USING btree ("_order");
  CREATE INDEX "projects_links_parent_id_idx" ON "projects_links" USING btree ("_parent_id");
  CREATE INDEX "projects_links_locale_idx" ON "projects_links" USING btree ("_locale");
  CREATE INDEX "projects_links_project_idx" ON "projects_links" USING btree ("project_id");
  CREATE INDEX "projects_visible_in_order_idx" ON "projects_visible_in" USING btree ("order");
  CREATE INDEX "projects_visible_in_parent_idx" ON "projects_visible_in" USING btree ("parent_id");
  CREATE UNIQUE INDEX "projects_code_idx" ON "projects" USING btree ("code");
  CREATE INDEX "projects_hero_image_idx" ON "projects" USING btree ("hero_image_id");
  CREATE INDEX "projects_preview_image_idx" ON "projects" USING btree ("preview_image_id");
  CREATE UNIQUE INDEX "projects_legacy_id_idx" ON "projects" USING btree ("legacy_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_project_categories_id_idx" ON "projects_rels" USING btree ("project_categories_id");
  CREATE INDEX "projects_rels_projects_id_idx" ON "projects_rels" USING btree ("projects_id");
  CREATE INDEX "_projects_v_blocks_image_modifiers_order_idx" ON "_projects_v_blocks_image_modifiers" USING btree ("order");
  CREATE INDEX "_projects_v_blocks_image_modifiers_parent_idx" ON "_projects_v_blocks_image_modifiers" USING btree ("parent_id");
  CREATE INDEX "_projects_v_blocks_image_order_idx" ON "_projects_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_image_parent_id_idx" ON "_projects_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_image_path_idx" ON "_projects_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_image_image_idx" ON "_projects_v_blocks_image" USING btree ("image_id");
  CREATE INDEX "_projects_v_blocks_text_modifiers_order_idx" ON "_projects_v_blocks_text_modifiers" USING btree ("order");
  CREATE INDEX "_projects_v_blocks_text_modifiers_parent_idx" ON "_projects_v_blocks_text_modifiers" USING btree ("parent_id");
  CREATE INDEX "_projects_v_blocks_text_order_idx" ON "_projects_v_blocks_text" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_text_parent_id_idx" ON "_projects_v_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_text_path_idx" ON "_projects_v_blocks_text" USING btree ("_path");
  CREATE UNIQUE INDEX "_projects_v_blocks_text_locales_locale_parent_id_unique" ON "_projects_v_blocks_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_blocks_news_reference_modifiers_order_idx" ON "_projects_v_blocks_news_reference_modifiers" USING btree ("order");
  CREATE INDEX "_projects_v_blocks_news_reference_modifiers_parent_idx" ON "_projects_v_blocks_news_reference_modifiers" USING btree ("parent_id");
  CREATE INDEX "_projects_v_blocks_news_reference_order_idx" ON "_projects_v_blocks_news_reference" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_news_reference_parent_id_idx" ON "_projects_v_blocks_news_reference" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_news_reference_path_idx" ON "_projects_v_blocks_news_reference" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_news_reference_news_idx" ON "_projects_v_blocks_news_reference" USING btree ("news_id");
  CREATE INDEX "_projects_v_blocks_topic_reference_modifiers_order_idx" ON "_projects_v_blocks_topic_reference_modifiers" USING btree ("order");
  CREATE INDEX "_projects_v_blocks_topic_reference_modifiers_parent_idx" ON "_projects_v_blocks_topic_reference_modifiers" USING btree ("parent_id");
  CREATE INDEX "_projects_v_blocks_topic_reference_order_idx" ON "_projects_v_blocks_topic_reference" USING btree ("_order");
  CREATE INDEX "_projects_v_blocks_topic_reference_parent_id_idx" ON "_projects_v_blocks_topic_reference" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_blocks_topic_reference_path_idx" ON "_projects_v_blocks_topic_reference" USING btree ("_path");
  CREATE INDEX "_projects_v_blocks_topic_reference_topic_idx" ON "_projects_v_blocks_topic_reference" USING btree ("topic_id");
  CREATE INDEX "_projects_v_version_links_order_idx" ON "_projects_v_version_links" USING btree ("_order");
  CREATE INDEX "_projects_v_version_links_parent_id_idx" ON "_projects_v_version_links" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_links_locale_idx" ON "_projects_v_version_links" USING btree ("_locale");
  CREATE INDEX "_projects_v_version_links_project_idx" ON "_projects_v_version_links" USING btree ("project_id");
  CREATE INDEX "_projects_v_version_visible_in_order_idx" ON "_projects_v_version_visible_in" USING btree ("order");
  CREATE INDEX "_projects_v_version_visible_in_parent_idx" ON "_projects_v_version_visible_in" USING btree ("parent_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_code_idx" ON "_projects_v" USING btree ("version_code");
  CREATE INDEX "_projects_v_version_version_hero_image_idx" ON "_projects_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_projects_v_version_version_preview_image_idx" ON "_projects_v" USING btree ("version_preview_image_id");
  CREATE INDEX "_projects_v_version_version_legacy_id_idx" ON "_projects_v" USING btree ("version_legacy_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_snapshot_idx" ON "_projects_v" USING btree ("snapshot");
  CREATE INDEX "_projects_v_published_locale_idx" ON "_projects_v" USING btree ("published_locale");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_projects_v_locales_locale_parent_id_unique" ON "_projects_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX "_projects_v_rels_project_categories_id_idx" ON "_projects_v_rels" USING btree ("project_categories_id");
  CREATE INDEX "_projects_v_rels_projects_id_idx" ON "_projects_v_rels" USING btree ("projects_id");
  CREATE INDEX "project_categories_breadcrumbs_order_idx" ON "project_categories_breadcrumbs" USING btree ("_order");
  CREATE INDEX "project_categories_breadcrumbs_parent_id_idx" ON "project_categories_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "project_categories_breadcrumbs_locale_idx" ON "project_categories_breadcrumbs" USING btree ("_locale");
  CREATE INDEX "project_categories_breadcrumbs_doc_idx" ON "project_categories_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "project_categories__order_idx" ON "project_categories" USING btree ("_order");
  CREATE UNIQUE INDEX "project_categories_legacy_id_idx" ON "project_categories" USING btree ("legacy_id");
  CREATE INDEX "project_categories_parent_idx" ON "project_categories" USING btree ("parent_id");
  CREATE INDEX "project_categories_updated_at_idx" ON "project_categories" USING btree ("updated_at");
  CREATE INDEX "project_categories_created_at_idx" ON "project_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "project_categories_locales_locale_parent_id_unique" ON "project_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_timeline_order_idx" ON "pages_timeline" USING btree ("_order");
  CREATE INDEX "pages_timeline_parent_id_idx" ON "pages_timeline" USING btree ("_parent_id");
  CREATE INDEX "pages_timeline_locale_idx" ON "pages_timeline" USING btree ("_locale");
  CREATE INDEX "pages_blocks_image_modifiers_order_idx" ON "pages_blocks_image_modifiers" USING btree ("order");
  CREATE INDEX "pages_blocks_image_modifiers_parent_idx" ON "pages_blocks_image_modifiers" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_image_modifiers_locale_idx" ON "pages_blocks_image_modifiers" USING btree ("locale");
  CREATE INDEX "pages_blocks_image_order_idx" ON "pages_blocks_image" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_parent_id_idx" ON "pages_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_path_idx" ON "pages_blocks_image" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_locale_idx" ON "pages_blocks_image" USING btree ("_locale");
  CREATE INDEX "pages_blocks_image_image_idx" ON "pages_blocks_image" USING btree ("image_id");
  CREATE INDEX "pages_blocks_text_modifiers_order_idx" ON "pages_blocks_text_modifiers" USING btree ("order");
  CREATE INDEX "pages_blocks_text_modifiers_parent_idx" ON "pages_blocks_text_modifiers" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_text_modifiers_locale_idx" ON "pages_blocks_text_modifiers" USING btree ("locale");
  CREATE INDEX "pages_blocks_text_order_idx" ON "pages_blocks_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_parent_id_idx" ON "pages_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_path_idx" ON "pages_blocks_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_text_locale_idx" ON "pages_blocks_text" USING btree ("_locale");
  CREATE INDEX "pages_blocks_news_reference_modifiers_order_idx" ON "pages_blocks_news_reference_modifiers" USING btree ("order");
  CREATE INDEX "pages_blocks_news_reference_modifiers_parent_idx" ON "pages_blocks_news_reference_modifiers" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_news_reference_modifiers_locale_idx" ON "pages_blocks_news_reference_modifiers" USING btree ("locale");
  CREATE INDEX "pages_blocks_news_reference_order_idx" ON "pages_blocks_news_reference" USING btree ("_order");
  CREATE INDEX "pages_blocks_news_reference_parent_id_idx" ON "pages_blocks_news_reference" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_news_reference_path_idx" ON "pages_blocks_news_reference" USING btree ("_path");
  CREATE INDEX "pages_blocks_news_reference_locale_idx" ON "pages_blocks_news_reference" USING btree ("_locale");
  CREATE INDEX "pages_blocks_news_reference_news_idx" ON "pages_blocks_news_reference" USING btree ("news_id");
  CREATE INDEX "pages_blocks_topic_reference_modifiers_order_idx" ON "pages_blocks_topic_reference_modifiers" USING btree ("order");
  CREATE INDEX "pages_blocks_topic_reference_modifiers_parent_idx" ON "pages_blocks_topic_reference_modifiers" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_topic_reference_modifiers_locale_idx" ON "pages_blocks_topic_reference_modifiers" USING btree ("locale");
  CREATE INDEX "pages_blocks_topic_reference_order_idx" ON "pages_blocks_topic_reference" USING btree ("_order");
  CREATE INDEX "pages_blocks_topic_reference_parent_id_idx" ON "pages_blocks_topic_reference" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_topic_reference_path_idx" ON "pages_blocks_topic_reference" USING btree ("_path");
  CREATE INDEX "pages_blocks_topic_reference_locale_idx" ON "pages_blocks_topic_reference" USING btree ("_locale");
  CREATE INDEX "pages_blocks_topic_reference_topic_idx" ON "pages_blocks_topic_reference" USING btree ("topic_id");
  CREATE UNIQUE INDEX "pages_key_idx" ON "pages" USING btree ("key");
  CREATE INDEX "pages_image_idx" ON "pages" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_legacy_id_idx" ON "pages" USING btree ("legacy_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_version_timeline_order_idx" ON "_pages_v_version_timeline" USING btree ("_order");
  CREATE INDEX "_pages_v_version_timeline_parent_id_idx" ON "_pages_v_version_timeline" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_timeline_locale_idx" ON "_pages_v_version_timeline" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_modifiers_order_idx" ON "_pages_v_blocks_image_modifiers" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_image_modifiers_parent_idx" ON "_pages_v_blocks_image_modifiers" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_image_modifiers_locale_idx" ON "_pages_v_blocks_image_modifiers" USING btree ("locale");
  CREATE INDEX "_pages_v_blocks_image_order_idx" ON "_pages_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_parent_id_idx" ON "_pages_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_path_idx" ON "_pages_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_locale_idx" ON "_pages_v_blocks_image" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_image_idx" ON "_pages_v_blocks_image" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_text_modifiers_order_idx" ON "_pages_v_blocks_text_modifiers" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_text_modifiers_parent_idx" ON "_pages_v_blocks_text_modifiers" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_text_modifiers_locale_idx" ON "_pages_v_blocks_text_modifiers" USING btree ("locale");
  CREATE INDEX "_pages_v_blocks_text_order_idx" ON "_pages_v_blocks_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_text_parent_id_idx" ON "_pages_v_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_text_path_idx" ON "_pages_v_blocks_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_text_locale_idx" ON "_pages_v_blocks_text" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_news_reference_modifiers_order_idx" ON "_pages_v_blocks_news_reference_modifiers" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_news_reference_modifiers_parent_idx" ON "_pages_v_blocks_news_reference_modifiers" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_news_reference_modifiers_locale_idx" ON "_pages_v_blocks_news_reference_modifiers" USING btree ("locale");
  CREATE INDEX "_pages_v_blocks_news_reference_order_idx" ON "_pages_v_blocks_news_reference" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_news_reference_parent_id_idx" ON "_pages_v_blocks_news_reference" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_news_reference_path_idx" ON "_pages_v_blocks_news_reference" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_news_reference_locale_idx" ON "_pages_v_blocks_news_reference" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_news_reference_news_idx" ON "_pages_v_blocks_news_reference" USING btree ("news_id");
  CREATE INDEX "_pages_v_blocks_topic_reference_modifiers_order_idx" ON "_pages_v_blocks_topic_reference_modifiers" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_topic_reference_modifiers_parent_idx" ON "_pages_v_blocks_topic_reference_modifiers" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_topic_reference_modifiers_locale_idx" ON "_pages_v_blocks_topic_reference_modifiers" USING btree ("locale");
  CREATE INDEX "_pages_v_blocks_topic_reference_order_idx" ON "_pages_v_blocks_topic_reference" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_topic_reference_parent_id_idx" ON "_pages_v_blocks_topic_reference" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_topic_reference_path_idx" ON "_pages_v_blocks_topic_reference" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_topic_reference_locale_idx" ON "_pages_v_blocks_topic_reference" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_topic_reference_topic_idx" ON "_pages_v_blocks_topic_reference" USING btree ("topic_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_key_idx" ON "_pages_v" USING btree ("version_key");
  CREATE INDEX "_pages_v_version_version_image_idx" ON "_pages_v" USING btree ("version_image_id");
  CREATE INDEX "_pages_v_version_version_legacy_id_idx" ON "_pages_v" USING btree ("version_legacy_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "news_links_order_idx" ON "news_links" USING btree ("_order");
  CREATE INDEX "news_links_parent_id_idx" ON "news_links" USING btree ("_parent_id");
  CREATE INDEX "news_links_locale_idx" ON "news_links" USING btree ("_locale");
  CREATE INDEX "news_links_project_idx" ON "news_links" USING btree ("project_id");
  CREATE INDEX "news_visible_in_order_idx" ON "news_visible_in" USING btree ("order");
  CREATE INDEX "news_visible_in_parent_idx" ON "news_visible_in" USING btree ("parent_id");
  CREATE INDEX "news_image_idx" ON "news" USING btree ("image_id");
  CREATE UNIQUE INDEX "news_legacy_id_idx" ON "news" USING btree ("legacy_id");
  CREATE INDEX "news_updated_at_idx" ON "news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "news" USING btree ("created_at");
  CREATE INDEX "news__status_idx" ON "news" USING btree ("_status");
  CREATE UNIQUE INDEX "news_locales_locale_parent_id_unique" ON "news_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_news_v_version_links_order_idx" ON "_news_v_version_links" USING btree ("_order");
  CREATE INDEX "_news_v_version_links_parent_id_idx" ON "_news_v_version_links" USING btree ("_parent_id");
  CREATE INDEX "_news_v_version_links_locale_idx" ON "_news_v_version_links" USING btree ("_locale");
  CREATE INDEX "_news_v_version_links_project_idx" ON "_news_v_version_links" USING btree ("project_id");
  CREATE INDEX "_news_v_version_visible_in_order_idx" ON "_news_v_version_visible_in" USING btree ("order");
  CREATE INDEX "_news_v_version_visible_in_parent_idx" ON "_news_v_version_visible_in" USING btree ("parent_id");
  CREATE INDEX "_news_v_parent_idx" ON "_news_v" USING btree ("parent_id");
  CREATE INDEX "_news_v_version_version_image_idx" ON "_news_v" USING btree ("version_image_id");
  CREATE INDEX "_news_v_version_version_legacy_id_idx" ON "_news_v" USING btree ("version_legacy_id");
  CREATE INDEX "_news_v_version_version_updated_at_idx" ON "_news_v" USING btree ("version_updated_at");
  CREATE INDEX "_news_v_version_version_created_at_idx" ON "_news_v" USING btree ("version_created_at");
  CREATE INDEX "_news_v_version_version__status_idx" ON "_news_v" USING btree ("version__status");
  CREATE INDEX "_news_v_created_at_idx" ON "_news_v" USING btree ("created_at");
  CREATE INDEX "_news_v_updated_at_idx" ON "_news_v" USING btree ("updated_at");
  CREATE INDEX "_news_v_snapshot_idx" ON "_news_v" USING btree ("snapshot");
  CREATE INDEX "_news_v_published_locale_idx" ON "_news_v" USING btree ("published_locale");
  CREATE INDEX "_news_v_latest_idx" ON "_news_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_news_v_locales_locale_parent_id_unique" ON "_news_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "topics_blocks_image_modifiers_order_idx" ON "topics_blocks_image_modifiers" USING btree ("order");
  CREATE INDEX "topics_blocks_image_modifiers_parent_idx" ON "topics_blocks_image_modifiers" USING btree ("parent_id");
  CREATE INDEX "topics_blocks_image_order_idx" ON "topics_blocks_image" USING btree ("_order");
  CREATE INDEX "topics_blocks_image_parent_id_idx" ON "topics_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "topics_blocks_image_path_idx" ON "topics_blocks_image" USING btree ("_path");
  CREATE INDEX "topics_blocks_image_image_idx" ON "topics_blocks_image" USING btree ("image_id");
  CREATE INDEX "topics_blocks_text_modifiers_order_idx" ON "topics_blocks_text_modifiers" USING btree ("order");
  CREATE INDEX "topics_blocks_text_modifiers_parent_idx" ON "topics_blocks_text_modifiers" USING btree ("parent_id");
  CREATE INDEX "topics_blocks_text_order_idx" ON "topics_blocks_text" USING btree ("_order");
  CREATE INDEX "topics_blocks_text_parent_id_idx" ON "topics_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "topics_blocks_text_path_idx" ON "topics_blocks_text" USING btree ("_path");
  CREATE UNIQUE INDEX "topics_blocks_text_locales_locale_parent_id_unique" ON "topics_blocks_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "topics_blocks_news_reference_modifiers_order_idx" ON "topics_blocks_news_reference_modifiers" USING btree ("order");
  CREATE INDEX "topics_blocks_news_reference_modifiers_parent_idx" ON "topics_blocks_news_reference_modifiers" USING btree ("parent_id");
  CREATE INDEX "topics_blocks_news_reference_order_idx" ON "topics_blocks_news_reference" USING btree ("_order");
  CREATE INDEX "topics_blocks_news_reference_parent_id_idx" ON "topics_blocks_news_reference" USING btree ("_parent_id");
  CREATE INDEX "topics_blocks_news_reference_path_idx" ON "topics_blocks_news_reference" USING btree ("_path");
  CREATE INDEX "topics_blocks_news_reference_news_idx" ON "topics_blocks_news_reference" USING btree ("news_id");
  CREATE INDEX "topics_blocks_topic_reference_modifiers_order_idx" ON "topics_blocks_topic_reference_modifiers" USING btree ("order");
  CREATE INDEX "topics_blocks_topic_reference_modifiers_parent_idx" ON "topics_blocks_topic_reference_modifiers" USING btree ("parent_id");
  CREATE INDEX "topics_blocks_topic_reference_order_idx" ON "topics_blocks_topic_reference" USING btree ("_order");
  CREATE INDEX "topics_blocks_topic_reference_parent_id_idx" ON "topics_blocks_topic_reference" USING btree ("_parent_id");
  CREATE INDEX "topics_blocks_topic_reference_path_idx" ON "topics_blocks_topic_reference" USING btree ("_path");
  CREATE INDEX "topics_blocks_topic_reference_topic_idx" ON "topics_blocks_topic_reference" USING btree ("topic_id");
  CREATE INDEX "topics_image_idx" ON "topics" USING btree ("image_id");
  CREATE UNIQUE INDEX "topics_legacy_id_idx" ON "topics" USING btree ("legacy_id");
  CREATE INDEX "topics_updated_at_idx" ON "topics" USING btree ("updated_at");
  CREATE INDEX "topics_created_at_idx" ON "topics" USING btree ("created_at");
  CREATE INDEX "topics__status_idx" ON "topics" USING btree ("_status");
  CREATE UNIQUE INDEX "topics_locales_locale_parent_id_unique" ON "topics_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "topics_rels_order_idx" ON "topics_rels" USING btree ("order");
  CREATE INDEX "topics_rels_parent_idx" ON "topics_rels" USING btree ("parent_id");
  CREATE INDEX "topics_rels_path_idx" ON "topics_rels" USING btree ("path");
  CREATE INDEX "topics_rels_projects_id_idx" ON "topics_rels" USING btree ("projects_id");
  CREATE INDEX "_topics_v_blocks_image_modifiers_order_idx" ON "_topics_v_blocks_image_modifiers" USING btree ("order");
  CREATE INDEX "_topics_v_blocks_image_modifiers_parent_idx" ON "_topics_v_blocks_image_modifiers" USING btree ("parent_id");
  CREATE INDEX "_topics_v_blocks_image_order_idx" ON "_topics_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_topics_v_blocks_image_parent_id_idx" ON "_topics_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_blocks_image_path_idx" ON "_topics_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_topics_v_blocks_image_image_idx" ON "_topics_v_blocks_image" USING btree ("image_id");
  CREATE INDEX "_topics_v_blocks_text_modifiers_order_idx" ON "_topics_v_blocks_text_modifiers" USING btree ("order");
  CREATE INDEX "_topics_v_blocks_text_modifiers_parent_idx" ON "_topics_v_blocks_text_modifiers" USING btree ("parent_id");
  CREATE INDEX "_topics_v_blocks_text_order_idx" ON "_topics_v_blocks_text" USING btree ("_order");
  CREATE INDEX "_topics_v_blocks_text_parent_id_idx" ON "_topics_v_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_blocks_text_path_idx" ON "_topics_v_blocks_text" USING btree ("_path");
  CREATE UNIQUE INDEX "_topics_v_blocks_text_locales_locale_parent_id_unique" ON "_topics_v_blocks_text_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_topics_v_blocks_news_reference_modifiers_order_idx" ON "_topics_v_blocks_news_reference_modifiers" USING btree ("order");
  CREATE INDEX "_topics_v_blocks_news_reference_modifiers_parent_idx" ON "_topics_v_blocks_news_reference_modifiers" USING btree ("parent_id");
  CREATE INDEX "_topics_v_blocks_news_reference_order_idx" ON "_topics_v_blocks_news_reference" USING btree ("_order");
  CREATE INDEX "_topics_v_blocks_news_reference_parent_id_idx" ON "_topics_v_blocks_news_reference" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_blocks_news_reference_path_idx" ON "_topics_v_blocks_news_reference" USING btree ("_path");
  CREATE INDEX "_topics_v_blocks_news_reference_news_idx" ON "_topics_v_blocks_news_reference" USING btree ("news_id");
  CREATE INDEX "_topics_v_blocks_topic_reference_modifiers_order_idx" ON "_topics_v_blocks_topic_reference_modifiers" USING btree ("order");
  CREATE INDEX "_topics_v_blocks_topic_reference_modifiers_parent_idx" ON "_topics_v_blocks_topic_reference_modifiers" USING btree ("parent_id");
  CREATE INDEX "_topics_v_blocks_topic_reference_order_idx" ON "_topics_v_blocks_topic_reference" USING btree ("_order");
  CREATE INDEX "_topics_v_blocks_topic_reference_parent_id_idx" ON "_topics_v_blocks_topic_reference" USING btree ("_parent_id");
  CREATE INDEX "_topics_v_blocks_topic_reference_path_idx" ON "_topics_v_blocks_topic_reference" USING btree ("_path");
  CREATE INDEX "_topics_v_blocks_topic_reference_topic_idx" ON "_topics_v_blocks_topic_reference" USING btree ("topic_id");
  CREATE INDEX "_topics_v_parent_idx" ON "_topics_v" USING btree ("parent_id");
  CREATE INDEX "_topics_v_version_version_image_idx" ON "_topics_v" USING btree ("version_image_id");
  CREATE INDEX "_topics_v_version_version_legacy_id_idx" ON "_topics_v" USING btree ("version_legacy_id");
  CREATE INDEX "_topics_v_version_version_updated_at_idx" ON "_topics_v" USING btree ("version_updated_at");
  CREATE INDEX "_topics_v_version_version_created_at_idx" ON "_topics_v" USING btree ("version_created_at");
  CREATE INDEX "_topics_v_version_version__status_idx" ON "_topics_v" USING btree ("version__status");
  CREATE INDEX "_topics_v_created_at_idx" ON "_topics_v" USING btree ("created_at");
  CREATE INDEX "_topics_v_updated_at_idx" ON "_topics_v" USING btree ("updated_at");
  CREATE INDEX "_topics_v_snapshot_idx" ON "_topics_v" USING btree ("snapshot");
  CREATE INDEX "_topics_v_published_locale_idx" ON "_topics_v" USING btree ("published_locale");
  CREATE INDEX "_topics_v_latest_idx" ON "_topics_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_topics_v_locales_locale_parent_id_unique" ON "_topics_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_topics_v_rels_order_idx" ON "_topics_v_rels" USING btree ("order");
  CREATE INDEX "_topics_v_rels_parent_idx" ON "_topics_v_rels" USING btree ("parent_id");
  CREATE INDEX "_topics_v_rels_path_idx" ON "_topics_v_rels" USING btree ("path");
  CREATE INDEX "_topics_v_rels_projects_id_idx" ON "_topics_v_rels" USING btree ("projects_id");
  CREATE INDEX "awards_links_order_idx" ON "awards_links" USING btree ("_order");
  CREATE INDEX "awards_links_parent_id_idx" ON "awards_links" USING btree ("_parent_id");
  CREATE INDEX "awards_links_locale_idx" ON "awards_links" USING btree ("_locale");
  CREATE INDEX "awards_links_project_idx" ON "awards_links" USING btree ("project_id");
  CREATE INDEX "awards_visible_in_order_idx" ON "awards_visible_in" USING btree ("order");
  CREATE INDEX "awards_visible_in_parent_idx" ON "awards_visible_in" USING btree ("parent_id");
  CREATE INDEX "awards_image_idx" ON "awards" USING btree ("image_id");
  CREATE UNIQUE INDEX "awards_legacy_id_idx" ON "awards" USING btree ("legacy_id");
  CREATE INDEX "awards_updated_at_idx" ON "awards" USING btree ("updated_at");
  CREATE INDEX "awards_created_at_idx" ON "awards" USING btree ("created_at");
  CREATE INDEX "awards__status_idx" ON "awards" USING btree ("_status");
  CREATE UNIQUE INDEX "awards_locales_locale_parent_id_unique" ON "awards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_awards_v_version_links_order_idx" ON "_awards_v_version_links" USING btree ("_order");
  CREATE INDEX "_awards_v_version_links_parent_id_idx" ON "_awards_v_version_links" USING btree ("_parent_id");
  CREATE INDEX "_awards_v_version_links_locale_idx" ON "_awards_v_version_links" USING btree ("_locale");
  CREATE INDEX "_awards_v_version_links_project_idx" ON "_awards_v_version_links" USING btree ("project_id");
  CREATE INDEX "_awards_v_version_visible_in_order_idx" ON "_awards_v_version_visible_in" USING btree ("order");
  CREATE INDEX "_awards_v_version_visible_in_parent_idx" ON "_awards_v_version_visible_in" USING btree ("parent_id");
  CREATE INDEX "_awards_v_parent_idx" ON "_awards_v" USING btree ("parent_id");
  CREATE INDEX "_awards_v_version_version_image_idx" ON "_awards_v" USING btree ("version_image_id");
  CREATE INDEX "_awards_v_version_version_legacy_id_idx" ON "_awards_v" USING btree ("version_legacy_id");
  CREATE INDEX "_awards_v_version_version_updated_at_idx" ON "_awards_v" USING btree ("version_updated_at");
  CREATE INDEX "_awards_v_version_version_created_at_idx" ON "_awards_v" USING btree ("version_created_at");
  CREATE INDEX "_awards_v_version_version__status_idx" ON "_awards_v" USING btree ("version__status");
  CREATE INDEX "_awards_v_created_at_idx" ON "_awards_v" USING btree ("created_at");
  CREATE INDEX "_awards_v_updated_at_idx" ON "_awards_v" USING btree ("updated_at");
  CREATE INDEX "_awards_v_snapshot_idx" ON "_awards_v" USING btree ("snapshot");
  CREATE INDEX "_awards_v_published_locale_idx" ON "_awards_v" USING btree ("published_locale");
  CREATE INDEX "_awards_v_latest_idx" ON "_awards_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_awards_v_locales_locale_parent_id_unique" ON "_awards_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "publications_visible_in_order_idx" ON "publications_visible_in" USING btree ("order");
  CREATE INDEX "publications_visible_in_parent_idx" ON "publications_visible_in" USING btree ("parent_id");
  CREATE INDEX "publications_category_idx" ON "publications" USING btree ("category_id");
  CREATE INDEX "publications_image_idx" ON "publications" USING btree ("image_id");
  CREATE INDEX "publications_file_idx" ON "publications" USING btree ("file_id");
  CREATE UNIQUE INDEX "publications_legacy_id_idx" ON "publications" USING btree ("legacy_id");
  CREATE INDEX "publications_updated_at_idx" ON "publications" USING btree ("updated_at");
  CREATE INDEX "publications_created_at_idx" ON "publications" USING btree ("created_at");
  CREATE INDEX "publications__status_idx" ON "publications" USING btree ("_status");
  CREATE UNIQUE INDEX "publications_locales_locale_parent_id_unique" ON "publications_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "publications_rels_order_idx" ON "publications_rels" USING btree ("order");
  CREATE INDEX "publications_rels_parent_idx" ON "publications_rels" USING btree ("parent_id");
  CREATE INDEX "publications_rels_path_idx" ON "publications_rels" USING btree ("path");
  CREATE INDEX "publications_rels_projects_id_idx" ON "publications_rels" USING btree ("projects_id");
  CREATE INDEX "_publications_v_version_visible_in_order_idx" ON "_publications_v_version_visible_in" USING btree ("order");
  CREATE INDEX "_publications_v_version_visible_in_parent_idx" ON "_publications_v_version_visible_in" USING btree ("parent_id");
  CREATE INDEX "_publications_v_parent_idx" ON "_publications_v" USING btree ("parent_id");
  CREATE INDEX "_publications_v_version_version_category_idx" ON "_publications_v" USING btree ("version_category_id");
  CREATE INDEX "_publications_v_version_version_image_idx" ON "_publications_v" USING btree ("version_image_id");
  CREATE INDEX "_publications_v_version_version_file_idx" ON "_publications_v" USING btree ("version_file_id");
  CREATE INDEX "_publications_v_version_version_legacy_id_idx" ON "_publications_v" USING btree ("version_legacy_id");
  CREATE INDEX "_publications_v_version_version_updated_at_idx" ON "_publications_v" USING btree ("version_updated_at");
  CREATE INDEX "_publications_v_version_version_created_at_idx" ON "_publications_v" USING btree ("version_created_at");
  CREATE INDEX "_publications_v_version_version__status_idx" ON "_publications_v" USING btree ("version__status");
  CREATE INDEX "_publications_v_created_at_idx" ON "_publications_v" USING btree ("created_at");
  CREATE INDEX "_publications_v_updated_at_idx" ON "_publications_v" USING btree ("updated_at");
  CREATE INDEX "_publications_v_snapshot_idx" ON "_publications_v" USING btree ("snapshot");
  CREATE INDEX "_publications_v_published_locale_idx" ON "_publications_v" USING btree ("published_locale");
  CREATE INDEX "_publications_v_latest_idx" ON "_publications_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_publications_v_locales_locale_parent_id_unique" ON "_publications_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_publications_v_rels_order_idx" ON "_publications_v_rels" USING btree ("order");
  CREATE INDEX "_publications_v_rels_parent_idx" ON "_publications_v_rels" USING btree ("parent_id");
  CREATE INDEX "_publications_v_rels_path_idx" ON "_publications_v_rels" USING btree ("path");
  CREATE INDEX "_publications_v_rels_projects_id_idx" ON "_publications_v_rels" USING btree ("projects_id");
  CREATE INDEX "publication_categories__order_idx" ON "publication_categories" USING btree ("_order");
  CREATE UNIQUE INDEX "publication_categories_legacy_id_idx" ON "publication_categories" USING btree ("legacy_id");
  CREATE INDEX "publication_categories_updated_at_idx" ON "publication_categories" USING btree ("updated_at");
  CREATE INDEX "publication_categories_created_at_idx" ON "publication_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "publication_categories_locales_locale_parent_id_unique" ON "publication_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "employees_office_idx" ON "employees" USING btree ("office_id");
  CREATE INDEX "employees_portrait_idx" ON "employees" USING btree ("portrait_id");
  CREATE UNIQUE INDEX "employees_legacy_id_idx" ON "employees" USING btree ("legacy_id");
  CREATE INDEX "employees_updated_at_idx" ON "employees" USING btree ("updated_at");
  CREATE INDEX "employees_created_at_idx" ON "employees" USING btree ("created_at");
  CREATE INDEX "employees__status_idx" ON "employees" USING btree ("_status");
  CREATE UNIQUE INDEX "employees_locales_locale_parent_id_unique" ON "employees_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_employees_v_parent_idx" ON "_employees_v" USING btree ("parent_id");
  CREATE INDEX "_employees_v_version_version_office_idx" ON "_employees_v" USING btree ("version_office_id");
  CREATE INDEX "_employees_v_version_version_portrait_idx" ON "_employees_v" USING btree ("version_portrait_id");
  CREATE INDEX "_employees_v_version_version_legacy_id_idx" ON "_employees_v" USING btree ("version_legacy_id");
  CREATE INDEX "_employees_v_version_version_updated_at_idx" ON "_employees_v" USING btree ("version_updated_at");
  CREATE INDEX "_employees_v_version_version_created_at_idx" ON "_employees_v" USING btree ("version_created_at");
  CREATE INDEX "_employees_v_version_version__status_idx" ON "_employees_v" USING btree ("version__status");
  CREATE INDEX "_employees_v_created_at_idx" ON "_employees_v" USING btree ("created_at");
  CREATE INDEX "_employees_v_updated_at_idx" ON "_employees_v" USING btree ("updated_at");
  CREATE INDEX "_employees_v_snapshot_idx" ON "_employees_v" USING btree ("snapshot");
  CREATE INDEX "_employees_v_published_locale_idx" ON "_employees_v" USING btree ("published_locale");
  CREATE INDEX "_employees_v_latest_idx" ON "_employees_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_employees_v_locales_locale_parent_id_unique" ON "_employees_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "offices__order_idx" ON "offices" USING btree ("_order");
  CREATE INDEX "offices_image_idx" ON "offices" USING btree ("image_id");
  CREATE UNIQUE INDEX "offices_legacy_id_idx" ON "offices" USING btree ("legacy_id");
  CREATE INDEX "offices_updated_at_idx" ON "offices" USING btree ("updated_at");
  CREATE INDEX "offices_created_at_idx" ON "offices" USING btree ("created_at");
  CREATE UNIQUE INDEX "offices_locales_locale_parent_id_unique" ON "offices_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "jobs_visible_in_order_idx" ON "jobs_visible_in" USING btree ("order");
  CREATE INDEX "jobs_visible_in_parent_idx" ON "jobs_visible_in" USING btree ("parent_id");
  CREATE INDEX "jobs_office_idx" ON "jobs" USING btree ("office_id");
  CREATE UNIQUE INDEX "jobs_legacy_id_idx" ON "jobs" USING btree ("legacy_id");
  CREATE INDEX "jobs_updated_at_idx" ON "jobs" USING btree ("updated_at");
  CREATE INDEX "jobs_created_at_idx" ON "jobs" USING btree ("created_at");
  CREATE INDEX "jobs__status_idx" ON "jobs" USING btree ("_status");
  CREATE UNIQUE INDEX "jobs_locales_locale_parent_id_unique" ON "jobs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_jobs_v_version_visible_in_order_idx" ON "_jobs_v_version_visible_in" USING btree ("order");
  CREATE INDEX "_jobs_v_version_visible_in_parent_idx" ON "_jobs_v_version_visible_in" USING btree ("parent_id");
  CREATE INDEX "_jobs_v_parent_idx" ON "_jobs_v" USING btree ("parent_id");
  CREATE INDEX "_jobs_v_version_version_office_idx" ON "_jobs_v" USING btree ("version_office_id");
  CREATE INDEX "_jobs_v_version_version_legacy_id_idx" ON "_jobs_v" USING btree ("version_legacy_id");
  CREATE INDEX "_jobs_v_version_version_updated_at_idx" ON "_jobs_v" USING btree ("version_updated_at");
  CREATE INDEX "_jobs_v_version_version_created_at_idx" ON "_jobs_v" USING btree ("version_created_at");
  CREATE INDEX "_jobs_v_version_version__status_idx" ON "_jobs_v" USING btree ("version__status");
  CREATE INDEX "_jobs_v_created_at_idx" ON "_jobs_v" USING btree ("created_at");
  CREATE INDEX "_jobs_v_updated_at_idx" ON "_jobs_v" USING btree ("updated_at");
  CREATE INDEX "_jobs_v_snapshot_idx" ON "_jobs_v" USING btree ("snapshot");
  CREATE INDEX "_jobs_v_published_locale_idx" ON "_jobs_v" USING btree ("published_locale");
  CREATE INDEX "_jobs_v_latest_idx" ON "_jobs_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_jobs_v_locales_locale_parent_id_unique" ON "_jobs_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "mines_site_type_order_idx" ON "mines_site_type" USING btree ("order");
  CREATE INDEX "mines_site_type_parent_idx" ON "mines_site_type" USING btree ("parent_id");
  CREATE INDEX "mines_extracted_materials_order_idx" ON "mines_extracted_materials" USING btree ("order");
  CREATE INDEX "mines_extracted_materials_parent_idx" ON "mines_extracted_materials" USING btree ("parent_id");
  CREATE INDEX "mines_updated_at_idx" ON "mines" USING btree ("updated_at");
  CREATE INDEX "mines_created_at_idx" ON "mines" USING btree ("created_at");
  CREATE UNIQUE INDEX "mines_locales_locale_parent_id_unique" ON "mines_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "mines_rels_order_idx" ON "mines_rels" USING btree ("order");
  CREATE INDEX "mines_rels_parent_idx" ON "mines_rels" USING btree ("parent_id");
  CREATE INDEX "mines_rels_path_idx" ON "mines_rels" USING btree ("path");
  CREATE INDEX "mines_rels_mine_features_id_idx" ON "mines_rels" USING btree ("mine_features_id");
  CREATE INDEX "mine_features_updated_at_idx" ON "mine_features" USING btree ("updated_at");
  CREATE INDEX "mine_features_created_at_idx" ON "mine_features" USING btree ("created_at");
  CREATE UNIQUE INDEX "mine_features_locales_locale_parent_id_unique" ON "mine_features_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_project_idx" ON "media" USING btree ("project_id");
  CREATE UNIQUE INDEX "media_legacy_id_idx" ON "media" USING btree ("legacy_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_w480_sizes_w480_filename_idx" ON "media" USING btree ("sizes_w480_filename");
  CREATE INDEX "media_sizes_w768_sizes_w768_filename_idx" ON "media" USING btree ("sizes_w768_filename");
  CREATE INDEX "media_sizes_w992_sizes_w992_filename_idx" ON "media" USING btree ("sizes_w992_filename");
  CREATE INDEX "media_sizes_w1382_sizes_w1382_filename_idx" ON "media" USING btree ("sizes_w1382_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_project_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("project_categories_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "payload_locked_documents_rels" USING btree ("news_id");
  CREATE INDEX "payload_locked_documents_rels_topics_id_idx" ON "payload_locked_documents_rels" USING btree ("topics_id");
  CREATE INDEX "payload_locked_documents_rels_awards_id_idx" ON "payload_locked_documents_rels" USING btree ("awards_id");
  CREATE INDEX "payload_locked_documents_rels_publications_id_idx" ON "payload_locked_documents_rels" USING btree ("publications_id");
  CREATE INDEX "payload_locked_documents_rels_publication_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("publication_categories_id");
  CREATE INDEX "payload_locked_documents_rels_employees_id_idx" ON "payload_locked_documents_rels" USING btree ("employees_id");
  CREATE INDEX "payload_locked_documents_rels_offices_id_idx" ON "payload_locked_documents_rels" USING btree ("offices_id");
  CREATE INDEX "payload_locked_documents_rels_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("jobs_id");
  CREATE INDEX "payload_locked_documents_rels_mines_id_idx" ON "payload_locked_documents_rels" USING btree ("mines_id");
  CREATE INDEX "payload_locked_documents_rels_mine_features_id_idx" ON "payload_locked_documents_rels" USING btree ("mine_features_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "project_gallery_rels_order_idx" ON "project_gallery_rels" USING btree ("order");
  CREATE INDEX "project_gallery_rels_parent_idx" ON "project_gallery_rels" USING btree ("parent_id");
  CREATE INDEX "project_gallery_rels_path_idx" ON "project_gallery_rels" USING btree ("path");
  CREATE INDEX "project_gallery_rels_locale_idx" ON "project_gallery_rels" USING btree ("locale");
  CREATE INDEX "project_gallery_rels_projects_id_idx" ON "project_gallery_rels" USING btree ("projects_id","locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_blocks_image_modifiers" CASCADE;
  DROP TABLE "projects_blocks_image" CASCADE;
  DROP TABLE "projects_blocks_text_modifiers" CASCADE;
  DROP TABLE "projects_blocks_text" CASCADE;
  DROP TABLE "projects_blocks_text_locales" CASCADE;
  DROP TABLE "projects_blocks_news_reference_modifiers" CASCADE;
  DROP TABLE "projects_blocks_news_reference" CASCADE;
  DROP TABLE "projects_blocks_topic_reference_modifiers" CASCADE;
  DROP TABLE "projects_blocks_topic_reference" CASCADE;
  DROP TABLE "projects_links" CASCADE;
  DROP TABLE "projects_visible_in" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "_projects_v_blocks_image_modifiers" CASCADE;
  DROP TABLE "_projects_v_blocks_image" CASCADE;
  DROP TABLE "_projects_v_blocks_text_modifiers" CASCADE;
  DROP TABLE "_projects_v_blocks_text" CASCADE;
  DROP TABLE "_projects_v_blocks_text_locales" CASCADE;
  DROP TABLE "_projects_v_blocks_news_reference_modifiers" CASCADE;
  DROP TABLE "_projects_v_blocks_news_reference" CASCADE;
  DROP TABLE "_projects_v_blocks_topic_reference_modifiers" CASCADE;
  DROP TABLE "_projects_v_blocks_topic_reference" CASCADE;
  DROP TABLE "_projects_v_version_links" CASCADE;
  DROP TABLE "_projects_v_version_visible_in" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_locales" CASCADE;
  DROP TABLE "_projects_v_rels" CASCADE;
  DROP TABLE "project_categories_breadcrumbs" CASCADE;
  DROP TABLE "project_categories" CASCADE;
  DROP TABLE "project_categories_locales" CASCADE;
  DROP TABLE "pages_timeline" CASCADE;
  DROP TABLE "pages_blocks_image_modifiers" CASCADE;
  DROP TABLE "pages_blocks_image" CASCADE;
  DROP TABLE "pages_blocks_text_modifiers" CASCADE;
  DROP TABLE "pages_blocks_text" CASCADE;
  DROP TABLE "pages_blocks_news_reference_modifiers" CASCADE;
  DROP TABLE "pages_blocks_news_reference" CASCADE;
  DROP TABLE "pages_blocks_topic_reference_modifiers" CASCADE;
  DROP TABLE "pages_blocks_topic_reference" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v_version_timeline" CASCADE;
  DROP TABLE "_pages_v_blocks_image_modifiers" CASCADE;
  DROP TABLE "_pages_v_blocks_image" CASCADE;
  DROP TABLE "_pages_v_blocks_text_modifiers" CASCADE;
  DROP TABLE "_pages_v_blocks_text" CASCADE;
  DROP TABLE "_pages_v_blocks_news_reference_modifiers" CASCADE;
  DROP TABLE "_pages_v_blocks_news_reference" CASCADE;
  DROP TABLE "_pages_v_blocks_topic_reference_modifiers" CASCADE;
  DROP TABLE "_pages_v_blocks_topic_reference" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "news_links" CASCADE;
  DROP TABLE "news_visible_in" CASCADE;
  DROP TABLE "news" CASCADE;
  DROP TABLE "news_locales" CASCADE;
  DROP TABLE "_news_v_version_links" CASCADE;
  DROP TABLE "_news_v_version_visible_in" CASCADE;
  DROP TABLE "_news_v" CASCADE;
  DROP TABLE "_news_v_locales" CASCADE;
  DROP TABLE "topics_blocks_image_modifiers" CASCADE;
  DROP TABLE "topics_blocks_image" CASCADE;
  DROP TABLE "topics_blocks_text_modifiers" CASCADE;
  DROP TABLE "topics_blocks_text" CASCADE;
  DROP TABLE "topics_blocks_text_locales" CASCADE;
  DROP TABLE "topics_blocks_news_reference_modifiers" CASCADE;
  DROP TABLE "topics_blocks_news_reference" CASCADE;
  DROP TABLE "topics_blocks_topic_reference_modifiers" CASCADE;
  DROP TABLE "topics_blocks_topic_reference" CASCADE;
  DROP TABLE "topics" CASCADE;
  DROP TABLE "topics_locales" CASCADE;
  DROP TABLE "topics_rels" CASCADE;
  DROP TABLE "_topics_v_blocks_image_modifiers" CASCADE;
  DROP TABLE "_topics_v_blocks_image" CASCADE;
  DROP TABLE "_topics_v_blocks_text_modifiers" CASCADE;
  DROP TABLE "_topics_v_blocks_text" CASCADE;
  DROP TABLE "_topics_v_blocks_text_locales" CASCADE;
  DROP TABLE "_topics_v_blocks_news_reference_modifiers" CASCADE;
  DROP TABLE "_topics_v_blocks_news_reference" CASCADE;
  DROP TABLE "_topics_v_blocks_topic_reference_modifiers" CASCADE;
  DROP TABLE "_topics_v_blocks_topic_reference" CASCADE;
  DROP TABLE "_topics_v" CASCADE;
  DROP TABLE "_topics_v_locales" CASCADE;
  DROP TABLE "_topics_v_rels" CASCADE;
  DROP TABLE "awards_links" CASCADE;
  DROP TABLE "awards_visible_in" CASCADE;
  DROP TABLE "awards" CASCADE;
  DROP TABLE "awards_locales" CASCADE;
  DROP TABLE "_awards_v_version_links" CASCADE;
  DROP TABLE "_awards_v_version_visible_in" CASCADE;
  DROP TABLE "_awards_v" CASCADE;
  DROP TABLE "_awards_v_locales" CASCADE;
  DROP TABLE "publications_visible_in" CASCADE;
  DROP TABLE "publications" CASCADE;
  DROP TABLE "publications_locales" CASCADE;
  DROP TABLE "publications_rels" CASCADE;
  DROP TABLE "_publications_v_version_visible_in" CASCADE;
  DROP TABLE "_publications_v" CASCADE;
  DROP TABLE "_publications_v_locales" CASCADE;
  DROP TABLE "_publications_v_rels" CASCADE;
  DROP TABLE "publication_categories" CASCADE;
  DROP TABLE "publication_categories_locales" CASCADE;
  DROP TABLE "employees" CASCADE;
  DROP TABLE "employees_locales" CASCADE;
  DROP TABLE "_employees_v" CASCADE;
  DROP TABLE "_employees_v_locales" CASCADE;
  DROP TABLE "offices" CASCADE;
  DROP TABLE "offices_locales" CASCADE;
  DROP TABLE "jobs_visible_in" CASCADE;
  DROP TABLE "jobs" CASCADE;
  DROP TABLE "jobs_locales" CASCADE;
  DROP TABLE "_jobs_v_version_visible_in" CASCADE;
  DROP TABLE "_jobs_v" CASCADE;
  DROP TABLE "_jobs_v_locales" CASCADE;
  DROP TABLE "mines_site_type" CASCADE;
  DROP TABLE "mines_extracted_materials" CASCADE;
  DROP TABLE "mines" CASCADE;
  DROP TABLE "mines_locales" CASCADE;
  DROP TABLE "mines_rels" CASCADE;
  DROP TABLE "mine_features" CASCADE;
  DROP TABLE "mine_features_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "project_gallery" CASCADE;
  DROP TABLE "project_gallery_rels" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_projects_blocks_image_modifiers";
  DROP TYPE "public"."enum_projects_blocks_image_size";
  DROP TYPE "public"."enum_projects_blocks_text_modifiers";
  DROP TYPE "public"."enum_projects_blocks_text_size";
  DROP TYPE "public"."enum_projects_blocks_news_reference_modifiers";
  DROP TYPE "public"."enum_projects_blocks_news_reference_size";
  DROP TYPE "public"."enum_projects_blocks_topic_reference_modifiers";
  DROP TYPE "public"."enum_projects_blocks_topic_reference_size";
  DROP TYPE "public"."enum_projects_links_kind";
  DROP TYPE "public"."enum_projects_visible_in";
  DROP TYPE "public"."enum_projects_type";
  DROP TYPE "public"."enum_projects_country";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_blocks_image_modifiers";
  DROP TYPE "public"."enum__projects_v_blocks_image_size";
  DROP TYPE "public"."enum__projects_v_blocks_text_modifiers";
  DROP TYPE "public"."enum__projects_v_blocks_text_size";
  DROP TYPE "public"."enum__projects_v_blocks_news_reference_modifiers";
  DROP TYPE "public"."enum__projects_v_blocks_news_reference_size";
  DROP TYPE "public"."enum__projects_v_blocks_topic_reference_modifiers";
  DROP TYPE "public"."enum__projects_v_blocks_topic_reference_size";
  DROP TYPE "public"."enum__projects_v_version_links_kind";
  DROP TYPE "public"."enum__projects_v_version_visible_in";
  DROP TYPE "public"."enum__projects_v_version_type";
  DROP TYPE "public"."enum__projects_v_version_country";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum__projects_v_published_locale";
  DROP TYPE "public"."enum_project_categories_menu_column";
  DROP TYPE "public"."enum_pages_blocks_image_modifiers";
  DROP TYPE "public"."enum_pages_blocks_image_size";
  DROP TYPE "public"."enum_pages_blocks_text_modifiers";
  DROP TYPE "public"."enum_pages_blocks_text_size";
  DROP TYPE "public"."enum_pages_blocks_news_reference_modifiers";
  DROP TYPE "public"."enum_pages_blocks_news_reference_size";
  DROP TYPE "public"."enum_pages_blocks_topic_reference_modifiers";
  DROP TYPE "public"."enum_pages_blocks_topic_reference_size";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_image_modifiers";
  DROP TYPE "public"."enum__pages_v_blocks_image_size";
  DROP TYPE "public"."enum__pages_v_blocks_text_modifiers";
  DROP TYPE "public"."enum__pages_v_blocks_text_size";
  DROP TYPE "public"."enum__pages_v_blocks_news_reference_modifiers";
  DROP TYPE "public"."enum__pages_v_blocks_news_reference_size";
  DROP TYPE "public"."enum__pages_v_blocks_topic_reference_modifiers";
  DROP TYPE "public"."enum__pages_v_blocks_topic_reference_size";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_news_links_kind";
  DROP TYPE "public"."enum_news_visible_in";
  DROP TYPE "public"."enum_news_status";
  DROP TYPE "public"."enum__news_v_version_links_kind";
  DROP TYPE "public"."enum__news_v_version_visible_in";
  DROP TYPE "public"."enum__news_v_version_status";
  DROP TYPE "public"."enum__news_v_published_locale";
  DROP TYPE "public"."enum_topics_blocks_image_modifiers";
  DROP TYPE "public"."enum_topics_blocks_image_size";
  DROP TYPE "public"."enum_topics_blocks_text_modifiers";
  DROP TYPE "public"."enum_topics_blocks_text_size";
  DROP TYPE "public"."enum_topics_blocks_news_reference_modifiers";
  DROP TYPE "public"."enum_topics_blocks_news_reference_size";
  DROP TYPE "public"."enum_topics_blocks_topic_reference_modifiers";
  DROP TYPE "public"."enum_topics_blocks_topic_reference_size";
  DROP TYPE "public"."enum_topics_status";
  DROP TYPE "public"."enum__topics_v_blocks_image_modifiers";
  DROP TYPE "public"."enum__topics_v_blocks_image_size";
  DROP TYPE "public"."enum__topics_v_blocks_text_modifiers";
  DROP TYPE "public"."enum__topics_v_blocks_text_size";
  DROP TYPE "public"."enum__topics_v_blocks_news_reference_modifiers";
  DROP TYPE "public"."enum__topics_v_blocks_news_reference_size";
  DROP TYPE "public"."enum__topics_v_blocks_topic_reference_modifiers";
  DROP TYPE "public"."enum__topics_v_blocks_topic_reference_size";
  DROP TYPE "public"."enum__topics_v_version_status";
  DROP TYPE "public"."enum__topics_v_published_locale";
  DROP TYPE "public"."enum_awards_links_kind";
  DROP TYPE "public"."enum_awards_visible_in";
  DROP TYPE "public"."enum_awards_status";
  DROP TYPE "public"."enum__awards_v_version_links_kind";
  DROP TYPE "public"."enum__awards_v_version_visible_in";
  DROP TYPE "public"."enum__awards_v_version_status";
  DROP TYPE "public"."enum__awards_v_published_locale";
  DROP TYPE "public"."enum_publications_visible_in";
  DROP TYPE "public"."enum_publications_status";
  DROP TYPE "public"."enum__publications_v_version_visible_in";
  DROP TYPE "public"."enum__publications_v_version_status";
  DROP TYPE "public"."enum__publications_v_published_locale";
  DROP TYPE "public"."enum_employees_status";
  DROP TYPE "public"."enum__employees_v_version_status";
  DROP TYPE "public"."enum__employees_v_published_locale";
  DROP TYPE "public"."enum_offices_address_country";
  DROP TYPE "public"."enum_jobs_visible_in";
  DROP TYPE "public"."enum_jobs_status";
  DROP TYPE "public"."enum__jobs_v_version_visible_in";
  DROP TYPE "public"."enum__jobs_v_version_status";
  DROP TYPE "public"."enum__jobs_v_published_locale";
  DROP TYPE "public"."enum_mines_site_type";
  DROP TYPE "public"."enum_mines_extracted_materials";
  DROP TYPE "public"."enum_mines_status";
  DROP TYPE "public"."enum_mine_features_color";`)
}
