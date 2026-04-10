const mongoose = require("mongoose");
const { MONGO_URI } = require("../config/env");
const Post = require("../models/Post");

/**
 * One-time migration: backfills totalLikeCount for all existing posts
 * that were created before the field was introduced.
 *
 * Usage: node src/scripts/migrateTotalLikeCount.js
 */
const migrate = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to database");

    const posts = await Post.find({});
    let updatedCount = 0;

    for (const post of posts) {
      const computed = post.likes.length + (post.guestLikeCount ?? 0);

      if (post.totalLikeCount !== computed) {
        post.totalLikeCount = computed;
        await post.save();
        updatedCount++;
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} / ${posts.length} posts.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();
