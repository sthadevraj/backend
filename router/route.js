const express = require("express");
const foodUserModel = require("../mongoose/model/food/loginModel")
const itemsModel = require("../mongoose/model/food/itemsModel");
const resturantModel = require("../mongoose/model/food/resturantModel")

const router = express.Router();
const bcrypt = require("bcrypt");
const cartModel = require("../mongoose/model/food/cartModel");
const userModel = require("../mongoose/model/usermodel");

var nodemailer = require("nodemailer");
const postModel = require("../mongoose/model/postmodel");
const session = require("express-session");
const commentModel = require("../mongoose/model/commentmodel");
const friendRequestModel = require("../mongoose/model/friendRequestModel");
const multer = require("multer");
const storyModel = require("../mongoose/model/storyModel");
const friendListModel = require("../mongoose/model/friendListModel");
const removeSuggestionModel = require("../mongoose/model/removeSuggestionModel");
const notificationModel = require("../mongoose/model/notification_model");
// const foodUserModel = require("../mongoose/model/food/loginModel")
// const itemModel = require("../mongoose/model/food/resturantModel")
// const resturantModel = require("../mongoose/model/food/resturantModel")
// const key = require("../mail_details/mail");
let userEmail = "ramesh@gmail.com";

router.get("/", (req, res) => {
  res.send("success");
});
const profilePicture = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../fbclone/assets/images/profile/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "." + file.originalname);
  },
});
const profileStorage = multer({ storage: profilePicture }).single("profile");
router.post("/new_account", profileStorage, async (req, res) => {
  let profilename;
  const password = req.body.password;
  let profile;
  const email = req.body.email;
  const gender = req.body.gender;
  const dob = req.body.dob;
  const fname = req.body.firstname;
  const lname = req.body.lastname;
  const fullname = fname + " " + lname;
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  console.log(hash);

  console.log(hash);
  console.log(req.body.email);
  console.log(req);
  userModel.find({ email: email }, async (err, doc) => {
    console.log(doc.length);
    if (!doc.length) {
      if (req.file) {
        console.log("yes");
        profilename =
          req.file.fieldname + "_" + Date.now() + "." + req.file.originalname;
      } else {
        profilename = "none";
        console.log("no");
      }

      const user = new userModel({
        name: fullname,
        email: email,
        profile: profilename,
        dob: dob,
        password: hash,
        gender: gender,
      });
      req.session.email = email;
      await user.save((err, doc) => {
        if (err) {
          res.status(500).send(" error" + err.message);
        } 
        else{
          userModel.find({email: email},(err,doc)=>{
            let lastUser=doc[doc.length-1];
            console.log(lastUser)
            res.send(lastUser);
          })
        }
      });
    } else {
      res.send("exits");
    }
  });
});
const postStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../fbclone/assets/images/post/");
  },

  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "." + file.originalname);
  },
});

var postUpload = multer({ storage: postStorage });
router.post("/post", async (req, res) => {
  let filename = [];
  // req.files.map((file) => {
  //   filename.push({ post: file.filename });
  // });
  req.body.posts.map((post) => {
    console.log(post);
  });
  const post = new postModel({
    userId: req.body.userId,
    status: req.body.status,
    posts: req.body.posts,
    likes: req.body.likes,
    email: req.body.email,
  });
  console.log(req.body);
  await post.save((err, doc) => {
    if (err) res.json({ message: err });
    else res.json(doc);
  });
});

router.post("/comment", async (req, res) => {
  const postId = req.body.postId;
  const email = req.body.email;
  const commentText = req.body.commentText;
  let comments = [];
  commentModel.find({ postId: postId }, async (err, doc) => {
    if (!doc.length) {
      const comment = new commentModel({
        postId: postId,
        comments: {
          email: email,
          commentText: commentText,
        },
      });
      await comment.save((err, doc) => {
       if(err){
        res.status(500).send("error"+err.message);
       }
       else{
        commentModel.findOne({ postId: postId}).then(async(doc) => {
          if (doc) {             
          let a= doc.comments[doc.comments.length - 1]
          console.log(a)
          let users = await userModel
            .findOne({ email: a['email'] })
            .select("name email profile");
           
            comments.push({
              users:users,
              comment:a['commentText'],
              isNotified: a['isNotified'],
              isImage: a['isImage'],
              commentAt: a['commentAt'],
              _id: a['_id'],
              commentReply: [],
              commentLike: [],
            });
            res.send(comments)
          }
        });
        // res.send(comments);
       }
      });
    } else {
      commentModel.updateOne(
        { postId: postId },
        {
          $push: {
            comments: {
              email: email,
              commentText: commentText,
            },
          },
        },
        (err, doc) => {
          if (err) res.status(500).send("error");
          else {
            commentModel.findOne({ postId: postId}).then(async(doc) => {
              if (doc) {             
              let a= doc.comments[doc.comments.length - 1]
              console.log(a)
              let users = await userModel
                .findOne({ email: a['email'] })
                .select("name email profile");
               
                comments.push({
                  users:users,
                  comment:a['commentText'],
                  isNotified: a['isNotified'],
                  isImage: a['isImage'],
                  commentAt: a['commentAt'],
                  _id: a['_id'],
                  commentReply: [],
                  commentLike: [],
                });
                res.send(comments)
              }
            });
            
          }
        }
      );
    }
  });
});
router.post("/commentlike", (req, res) => {
  const postId = req.body.postId;
  const commentId = req.body.commentId;
  const email = req.body.email;
  
  var message = " ";
  console.log(req.body);
  commentModel
    .findOne({ postId: postId})
    .then((post) => {
      if (post) {
        if (post.comments.find((comment) => comment._id == commentId)) {
          post.comments.find((c) => {
            if (c._id == commentId) {
              if (c.commentLikes.find((a) => a.email == email)) {
                c.commentLikes = c.commentLikes.filter((b) => b.email != email);
                post.save((err, doc) => {
                  if(err)
                  console.log(err);
                });
                message = "unlike";
              } else {
                c.commentLikes.push({
                  email: email,
                });
                post.save((err, doc) => {});
                message = "like";
              }
            }
          });
        }

        res.send(message);
        message = " ";
      } else {
        res.status(404).send("post not found");
      }
    })
    .catch((e) => {
      res.status(501).send(e.message);
    });
});

router.post("/commentReply", function (req, res) {
  const commentId = req.body.commentId;
  const postId = req.body.postId;
  console.log(req.body);
  var message = " ";
  commentModel
    .findOne({ postId: postId, commentId: commentId })
    .then((post) => {
      if (post) {
        if (post.comments.find((comment) => comment._id == commentId)) {
          post.comments.find((com) => {
            if (com._id == commentId) {
              console.log(com);
              post.comments.commentReplys = com.commentReplys.push({
                email: req.body.email,
                replyText: req.body.replyText,
              });
              post.save((err, doc) => {
                console.log("pushed");
              });
            }
          });
          message = "yse";
        } else {
          message = "no";
        }
        res.send(message);
        message = " ";
        // post.comments.commentReplys=post.comments.commentReplys.push({
        //      email: req.body.email,
        //       replyText: req.body.replyText,
        // })
        // post.save((err, doc)=>{
        //   res.send(doc);
        // })
      } else {
        request.status(404).send("post not found");
      }
    })
    .catch((e) => {
      res.status(501).send(e.message);
    });
  postModel.updateOne(
    {
      _Id: req.body.postId,
      "comments._Id": commentId,
    },
    {
      $push: {
        "comments.$[].commentReplys": {
          email: req.body.email,
          replyText: req.body.replyText,
        }
      },
    },
    (err, doc) => {
      if (err) res.send(err.message);
      else res.send(doc);
    }
  );
});
router.get("/replyLike", (req, res) => {
  let userId;
  let isNotified;
  req.body.replyLikes.map((e) => {
    userId = e.userId;
    isNotified = e.isNotified;
  });
  console.log(userId);
  postModel.find(
    {
      _Id: req.body.postId,
      "comments._Id": req.body.commentId,
      "comments.commentReplys.replyLikes.userId": userId,
    },
    (err, doc) => {
      if (!doc.length) {
        postModel.updateOne(
          {
            _Id: req.body.postId,
            "comments._Id": req.body.commentId,
            "comments.commentsReplys._Id": req.body.replyId,
          },
          {
            $push: {
              "comments.$[].commentReplys.$[].replyLikes": req.body.replyLikes,
            },
          },
          (err, doc) => {
            if (err) res.json({ message: err });
            else res.json(doc);
          }
        );
      } else {
        postModel.updateOne(
          {
            _Id: req.body.postId,
            "comments._Id": req.body.commentId,
            "comments.commentsReplys._Id": req.body.replyId,
          },
          {
            $pull: {
              "comments.$[].commentReplys.$[].replyLikes": {
                userId: userId,
                isNotified: isNotified,
              },
            },
          },
          (err, doc) => {
            if (err) res.json({ message: err });
            else res.json(doc);
          }
        );
      }
    }
  );
});
router.post("/friend_request_send", async (req, res) => {
  friendRequestModel.find(
    {
      sender: req.body.sender,
      receiver: req.body.receiver,
    },
    async (err, info) => {
      if (!info.length) {
        const request = new friendRequestModel({
          sender: req.body.sender,
          receiver: req.body.receiver,
        });
        await request.save((err, info) => {
          if (err) res.json({ message: "error" });
          else res.json(info);
        });
      } else if (err) res.json({ message: err });
      else {
        res.json({ message: "already send" });
      }
    }
  );
});

router.get("/request_receive", async (req, res) => {
  friendRequestModel.find({ receiver: req.body.receiver }, (err, doc) => {
    if (err) res.json({ message: "err" });
    else res.json(doc);
  });
});

router.get("/request_send", async (req, res) => {
  friendRequestModel.find({ sender: req.body.receiver }, (err, doc) => {
    if (err) res.json({ message: "err" });
    else res.json(doc);
  });
});

router.get("/dob", async (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDay();
  console.log(day);
  const id = [];
  const birthday = await userModel.aggregate([
    {
      $project: {
        year: { $year: "$dob" },
        month: { $month: "$dob" },
        day: { $dayOfMonth: "$dob" },
      },
    },
    {
      $match: { month: month, day: day },
    },
  ]);
  birthday.map((e) => {
    id.push(e._id);
  });
  // console.log(id);
  userModel.find({ _id: { $in: id } }, (err, doc) => {
    if (err) res.send({ message: "error" });
    else res.json(doc);
  });
});

router.post("/upload", (req, res) => {
  if (req.files.image) {
    res.status(200).json({ message: "succesaa" });
  } else {
    console.log("select an image");
  }
});

router.get("/users", function (req, res) {
  postModel.find({}, (err, doc) => {
    res.json(doc);
  });
});
router.post("/user", (req, res) => {
  userModel.find({ email: req.body.email }, (err, doc) => {
    if (err) res.json({ message: err });
    else res.json(doc);
    console.log(doc);
  });
});
router.post("/getcomments", (req, res) => {
  commentModel.find();
});
router.post("/like", (req, res) => {
  const postId = req.body.postId;
  const userId = req.body.userId;
  const email = req.body.email;
  const reaction = req.body.types;
  console.log(reaction);
  postModel
    .findById(postId)
    .then((post) => {
      if (post) {
        let myReactionIndex = post.reaction.indexOf(reaction);
        const exists = post.likes.some((obj) => obj.types == reaction);
        if (post.likes.find((like) => like.email == email)) {
          if (exists == false) {
            post.reaction.splice(myReactionIndex, 1);
          }
          post.likes = post.likes.filter((like) => like.email != email);
          return post.save((_) => {
            res.send("unlike");
          });
        } else {
          if (post.reaction.indexOf(reaction) !== -1) {
            // post.reaction.pull(reaction);

            console.log("exits");
          } else {
            post.reaction.push(reaction);
          }
          post.likes.push({
            userId: userId,
            email: email,
            types: req.body.types,
          });

          return post.save((_) => {
            res.send("like");
            console.log("pushed");
          });
        }
      } else {
        res.status(404).send("post not found.");
      }
    })
    .catch((err) => {
      console.log(err.message);
      res.send("an error occurred");
    });
});
router.post("/reaction", (req, res) => {
  const postId = req.body.postId;
  const reaction = req.body.reaction;
  postModel
    .findById(postId)
    .then((post) => {
      if (post) {
        if (post.reaction.indexOf(reaction) !== -1) {
          res.send("exits");
        } else {
          post.reaction.push(reaction);

          return post.save((err, doc) => {
            res.send(doc);
            console.log("pushed");
          });
        }
      } else {
        res.status(404).send("post not found.");
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "././upload/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      "upload" + "-" + Date.now() + "." + file.originalname.split(".")[1]
    );
  },
});

const upload = multer({ storage: storage }).single("file");
router.post("/uploader", function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      res.send(err.message);
    } else {
      res.send("uploaded");
    }
  });
  //  res.send(req.file)
  console.log(req.file, req.body);
});
const storyStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../fbclone/assets/images/story/");
  },

  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "." + file.originalname);
  },
});

var storyUpload = multer({ storage: storyStorage });
router.post("/story", storyUpload.array("image"), async (req, res) => {
  let filename = [];

  console.log(req.body);
  req.files.map((file) => {
    filename.push({ story: file.filename });
  });

  const story = new storyModel({
    storys: filename,
    email: req.body.email,
    views: 0,
    bg: req.body.bg,
  });
  await story.save((err, doc) => {
    if (err) res.send(err.message);
    else res.send("success");
  });
});
router.get("/story", (req, res) => {
  let storyUser = [];
  let likedUser = [];
  let viewUser = [];
  let story = [];
  let views = [];
  let storys = [];
  let likes = [];
  storyModel
    .aggregate([
      {
        $lookup: {
          from: "users",
          localField: "email",
          foreignField: "email",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "storys.views.email",
          foreignField: "email",
          as: "viewUser",
        },
      },
    ])
    .exec((err, docs) => {
      for (var i = 0; i < docs.length; i++) {
        docs[i].user.map((u) => {
          storyUser.push({
            name: u.name,
            email: u.email,
            profile: u.profile,
          });
        });

        // res.send(docs);
        docs[i].viewUser.map((user) => {
          viewUser.push({
            email: user.email,
            profile: user.profile,
            name: user.name,
          });
        });
        for (let j = 0; j < docs[i].storys.length; j++) {
          for (let k = 0; k < docs[i].storys[j].views.length; k++) {
            let temp = viewUser.find(
              (e) => e.email === docs[i].storys[j].views[k].email
            );
            // console.log(temp);
            if (temp.email) {
              docs[i].storys[j].views[k].email = temp.email;
              views.push({
                user: {
                  name: temp.name,
                  email: temp.email,
                  profile: temp.profile,
                },
                id: docs[i].storys[j].views[k]._id,
                reaction: docs[i].storys[j].views[k].reaction,
              });
            }
          }

          storys.push({
            story: docs[i].storys[j].story,
            view: views,

            type: docs[i].storys[j].type,
            id: docs[i].storys[j]._id,
          });

          views = [];
        }
        story.push({
          user: storyUser,
          story: storys,
          bg: docs[i].bg,
          id: docs[i]._id,
          email: docs[i].email,
          addedAt: docs[i].addedAt,
        });

        storyUser = [];
        views = [];
        storys = [];
      }

      res.send(story);
    });
});
router.post("/spost", (req, res) => {
  postModel.findById(req.body.postId, (err, doc) => {
    res.json(doc);
  });
});
router.get("/scomment", (req, res) => {
  const postId = req.query.postId;
  let comments = [];
  let commentReply = [];
  let commentLike = [];
  console.log(postId);
  commentModel.findOne({ postId: postId }).sort({'commentAt':1}).then((doc) => {
    if (doc) {
      // res.send(doc)
      //for commentReply
      doc.comments.map((comment) => {
        comment.commentReplys.map((reply) => {
          getUsers(reply.email).then((user) => {
            commentReply.push({
              user,
              replyText: reply.replyText,
              isNotified: reply.isNotified,
              isImage: reply.isImage,
              replyAt: reply.replyAt,
              _id: reply._id,
            });
          });
        });
        // for commentlike
        comment.commentLikes.map((like) => {
          return getUsers(like.email).then((user) => {
            return commentLike.push({
              user,
              isNotified: like.isNotified,
              _id: like._id,
              type:"likes"
            });
          });
        });
        getUsers(comment.email).then((users) => {
          comments.push({
            users,
            comment: comment.commentText,
            isNotified: comment.isNotified,
            isImage: comment.isImage,
            commentAt: comment.commentAt,
            _id: comment._id,
            commentReply: commentReply,
            likes: commentLike,
          });
          commentLike = [];
          commentReply = [];

          if (comments.length == doc.comments.length) {
            res.json(comments);
          }
        });
      });
    } else {
      res.status(404).send("no comment found");
    }
  });
});
const getUsers = (email) => {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      userModel.findOne({ email: email }, (err, info) => {
        // console.log("info", info);
        // console.log("email", email);

        resolve({
          name: info.name,
          email: info.email,
          profile: info.profile,
        });
      });
    }, 0);
  });
};

router.post("/storyReaction", async (req, res) => {
  const reaction = req.body.reaction;
  const email = req.body.email;
  const storysId = req.body.storysId;
  const storyId = req.body.storyId;
  var message = " ";
  console.log(reaction);
  storyModel
    .findOne({ _id: storysId })
    .then((story) => {
      if (story) {
        if (story.storys.find((s) => s._id == storyId)) {
          story.storys.find((c) => {
            if (c._id == storyId) {
              if (c.views.find((a) => a.email == email)) {
                for (var i = 0; i < c.views.length; i++) {
                  if (c.views[i].email == email) {
                    c.views[i].reaction = reaction;
                  }
                }
              } else {
                c.views.push({
                  email: email,
                  reaction: reaction,
                });
              }
              story.save((err, doc) => {
                res.send("success");
              });
            }
          });
        } else {
          res.send("Story Id is not matched");
        }
      } else {
        res.send("post not exist");
      }
      console.log(message);
      // res.send(message)
    })
    .catch((e) => {
      res.send(`some error has occured.Error message is ${e.message}`);
    });
});
router.post("/storyview", async (req, res) => {
  const storyId = req.body.storyId;
  const storysId = req.body.storysId;
  const email = req.body.email;
  storyModel
    .findOne({ _id: storysId })
    .then((story) => {
      if (story) {
        if (story.storys.find((s) => s._id == storyId)) {
          story.storys.find((c) => {
            if (c._id == storyId) {
              console.log("c", c);
              if (c.views.find((a) => a.email == email)) {
                console.log("already exit email");
              } else {
                // story.storys.views = c.views.push({
                //   email: email,
                //   reaction:req.body.reaction
                // });
                c.views.push({
                  email: email,
                  reaction: reaction,
                });
              }
            }
          });

          // post.comments.find((c) => {
          //   if (c._id == commentId) {
          //     if (c.commentLikes.find((a) => a.email == email)) {
          //       c.commentLikes = c.commentLikes.filter((b) => b.email != email);
          //       post.save((err, doc) => {});
          //       message = "unlike";
          //     } else {
          //       c.commentLikes.push({
          //         email: email,
          //       });
          //       post.save((err, doc) => {});
          //       message = "like";
          //     }
          //   }
          // });
          story.save((err, doc) => {
            res.send("success");
          });
        }
      } else {
        res.send("no story exist");
      }
    })
    .catch((e) => {
      res.send(`some error has occured.Error message is ${e.message}`);
    });
});
router.post("/textstory", (req, res) => {
  const story = new storyModel({
    storys: [
      {
        type: "text",
        story: "testing",
      },
      {
        type: "text",
        story: "testing status",
      },
    ],
    email: req.body.email,
  });
  story.save((err, doc) => {
    if (err) res.send(err.message);
    else res.send("success");
  });
  console.log(req.body);
});
router.get("/people_y_m_n", (req, res) => {
  let users = [];

  let new_array = [];
  const myEmail = "dstha221@gmail.com";

  new_array.push(myEmail);
  userModel
    .aggregate([
      {
        $lookup: {
          from: "friend_lists",
          localField: "email",
          foreignField: "friend",
          as: "friendList",
        },
      },
      {
        $lookup: {
          from: "frieend_requests",
          localField: "email",
          foreignField: "receiver",
          as: "request",
        },
      },
      {
        $lookup: {
          from: "removesuggestions",
          localField: "email",
          foreignField: "removed.1",
          as: "removedUser",
        },
      },
    ])
    .exec((err, docs) => {
      console.log(docs.length);
      docs.map((doc) => {
        if (myEmail != doc.email) {
          doc.friendList.map((friend) => {
            console.log(friend);
            if (friend.friend != myEmail || friend.me != myEmail) {
              console.log("true");
              new_array.push(friend.friend);
            } else {
              console.log("false");
            }
          });
          doc.request.map((friend) => {
            console.log(friend);
            if (friend.sender != myEmail || friend.receiver != myEmail) {
              console.log("true");
              new_array.push(friend.receiver);
            } else {
              console.log("false");
            }
          });
          doc.removedUser.map((user) => {
            if (user.removed[0] == myEmail) {
              new_array.push(user.removed[1]);
            }
          });
        }
      });
      uniqueArray = new_array.filter(function (elem, pos) {
        return new_array.indexOf(elem) == pos;
      });
      userModel.find({ email: { $nin: uniqueArray } }, async (err, doc) => {
        await doc.map((user) => {
          users.push({
            email: user.email,
            name: user.name,
            profile: user.profile,
            _id: user._id,
          });
        });
        res.send(doc);
      });

      // console.log(docs)

      console.log("unique", uniqueArray);
      // res.send(users);
    });
});
router.post("/sendRequest", (req, res) => {
  const from = req.body.from;
  const to = req.body.to;
  const friendRequest = new friendRequestModel({
    sender: from,
    receiver: to,
  });
  friendRequest.save((err, doc) => {
    if (err) {
      res.send("error: " + err.message);
    } else {
      res.send("success");
    }
  });
});
router.get("/friendRequest", (req, res) => {
  const myEmail = "anish@gmail.com";
  let friendRequest = [];
  let userlist = [];
  friendRequestModel
    .aggregate([
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "email",
          as: "user",
        },
      },
    ])
    .exec((err, doc) => {
      doc.map((request) => {
        if (request.receiver == myEmail) {
          console.log(request.user[0].name);
          request.user.map((user) => {
            userlist.push({
              name: user.name,
              email: user.email,
              profile: user.profile,
            });
          });
          friendRequest.push({
            _id: request._id,
            user: userlist,

            sendAt: request.sendAt,
            status: request.status,
          });
          userlist = [];
        }
      });
      res.send(friendRequest);
    });
});
router.post("/deleteRequest", (req, res) => {
  const to = req.body.to;
  const from = req.body.from;
  friendRequestModel.deleteOne({ to: to, from: from }, (err, doc) => {
    if (err) res.send("error: " + err.message);
    else res.send("success");
  });
});
router.post("/acceptRequest", (req, res) => {
  const friend = req.body.from;
  const me = req.body.to;
  const friendList = new friendListModel({
    friend: friend,
    me: me,
  });
  friendList.save((err, doc) => {
    if (err) res.send("error: " + err.message);
    else {
      friendRequestModel.deleteOne({ to: me, from: friend }, (err, doc) => {
        if (err) console.log("error: " + err.message);
        else console.log("success");
      });
      res.send("success");
    }
  });
});
router.post("/remove_suggestion", (req, res) => {
  const removeFrom = req.body.removeFrom;
  const removeUser = req.body.removeUser;
  const remove_Suggestion = new removeSuggestionModel({
    removed: [removeFrom, removeUser],
  });
  remove_Suggestion.save((err, doc) => {
    if (err) res.send("error" + err.message);
    else {
      res.send("success");
    }
  });
});
router.get("/user_post", async (req, res) => {
  userEmail=req.query.email;
  console.log(userEmail);
  let user =[];
  userModel.findOne({email:userEmail},(err,doc)=>{
    
      user.push({
        name:doc['name'],
        email:doc['email'],
        profile:doc['profile'],
      })
    
  })
  
  postModel.find({ email: userEmail }, async (err, docs) => {
    let post = [];
    for (let doc of docs) {
      let likeUser = [];
      let likeTypesAndId = [];
      doc.likes.map((likes) => {
        likeUser.push(likes.email);
        // console.log(likes)
        likeTypesAndId.push({
          _id: likes._id,
          isNotified: likes.isNotified,
          types: likes.types,
        });
      });
      let users = await getLikedUSer(likeUser);
      let totalComments = await getPostTotalComment(doc._id);
      let likes = users.doc.map((u, i) => {
        return {
          user: {
            name: u.name,
            email: u.email,
            profile: u.profile,
          },

          id: likeTypesAndId[i]._id,
          isNotified: likeTypesAndId[i].isNotified,
          types: likeTypesAndId[i].types,
        };
      });

      post.push({
        likes: likes,
        tComments: totalComments,
        posts: doc.posts,
        postAt: doc.postAt,
        status: doc.status,
        postId: doc._id,
        reaction: doc.reaction,
        user: user,
      });
    }
    res.send(post);
  });
});
const getLikedUSer = (email) => {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      userModel.find({ email: { $in: email } }, (err, doc) => {
        resolve({
          doc,
        });
      });
    }, 0);
  });
};
const getPostTotalComment = (postId) => {
  return new Promise(function (resolve, res) {
    setTimeout(function () {
      commentModel
        .findOne({ postId: postId })
        .select("postId")
        .lean()
        .then((result) => {
          if (result) {
            commentModel.findOne({ postId: postId }, (err, docs) => {
              resolve(docs.comments.length);
            });
          } else {
            resolve(0);
          }
        });
    });
  }, 0);
};

router.get("/my_friends", (req, res) => {
  friendListModel.find(
    { $or: [{ friend: userEmail }, { me: userEmail }] },
    async (err, docs) => {
      let friendsEmail = [];
      let friendsId = [];
      for (let doc of docs) {
        if (doc.friend == userEmail) {
          friendsEmail.push(doc.me);
        } else {
          friendsEmail.push(doc.friend);
        }
        friendsId.push({
          id: doc._id,
        });
      }
      let friendsList = await getLikedUSer(friendsEmail);
      let friends = friendsList.doc.map((friend, i) => {
        return {
          name: friend.name,
          email: friend.email,
          profile: friend.profile,
          _id: friendsId[i].id,
        };
      });
      res.json(friends);
    }
  );
});

router.get("/video", (req, res) => {
  let friendsEmail = [];
  let post = [];

  friendListModel.find({ me: userEmail }, async (err, docs) => {
    if (err) {
      return res.status(500).send(err);
    }
    for (let doc of docs) {
      if (doc.friend != userEmail) {
        friendsEmail.push(doc.friend);
      }
    }
    console.log("k", friendsEmail);
    for (let email of friendsEmail) {
      let userPost = await postModel.find({
        email: email,
        "posts.postType": "video",
      });
      for (let userPostData of userPost) {
        let likedUserEmail = [];
        let posts = [];
        let likeTypesAndId = [];
        userPostData.likes.map((like) => {
          likedUserEmail.push(like.email);
          likeTypesAndId.push({
            _id: like._id,
            isNotified: like.isNotified,
            types: like.types,
          });
        });
        // console.log(likedUser);
        let likedUsers = await getLikedUSer(likedUserEmail);
        let likes = likedUsers.doc.map((user, i) => {
          return {
            user: {
              name: user.name,
              email: user.email,
              profile: user.profile,
              gender: user.gender,
            },
            id: likeTypesAndId[i]._id,
            isNotified: likeTypesAndId[i].isNotified,
            types: likeTypesAndId[i].types,
          };
        });
        // let postUserInfo = await userModel.findOne({ email: email });
        let totalComments = await getPostTotalComment(userPostData._id);
        userPostData.posts.map((post) => {
          posts.push({
            postType: post.postType,
            _id: post._id,
            post: post.post,
          });
        });
        // console.log(userPostData._id)
        let postUserInfo = await userModel
          .findOne({ email: email })
          .select("name email profile");

        post.push({
          likes: likes,
          tComments: totalComments,
          user: [postUserInfo],
          posts: posts,
          postAt: userPostData.postAt,
          status: userPostData.status,
          postId: userPostData._id,
          reaction: userPostData.reaction,
        });
      }
    }
    res.send(post);
  });
});

router.post("/notification", (req, res) => {
  const notification = new notificationModel({
    email: req.body.email,
    type: req.body.type,
  });

  notification.save((err, doc) => {
    if (err) {
      res.status(500).send("error " + err.message);
    } else {
      res.send(doc);
    }
  });
});
router.post("/seen_notofication", (req, res) => {
  const notificationId = req.body.notificationId;
  const seenBy = req.body.seenBy;
  console.log(req.body);
  notificationModel
    .findOne({ _id: notificationId })
    .then((notification) => {
      if (notification) {
        if (notification.seenBy.indexOf(seenBy) == -1) {
          notification.seenBy.push(seenBy);
        }

        notification.save((err, doc) => {
          if (err) res.send("error" + err.message);
          else res.send("success");
        });
      } else {
        res.status(404).send("notification not found");
      }
    })
    .catch((e) => {
      res.send("error " + e.message);
    });
});
router.get("/get_notification", (req, res) => {
  friendListModel.find({ me: userEmail }, async (err, docs) => {
    let friendsEmail = [];
    let notification = [];
    if (err) {
      res.status(505).send("error " + err.message);
    } else {
      for (let doc of docs) {
        if (doc.friend != userEmail) {
          friendsEmail.push(doc.friend);
        }
      }
      for (let email of friendsEmail) {
        let notifications = await notificationModel.find({ email: email });
        for (let notice of notifications) {
          let userDetails = await userModel
            .findOne({ email: email })
            .select("name profile email");
          notification.push({
            user: userDetails,
            notification: notice,
          });
        }
      }
    }
    res.send(notification);
  });
});
router.post("/send_varification_code", async (req, res) => {
  const email = req.body.email;
  const varification_code = Math.floor(100000 + Math.random() * 90000);
  console.log(varification_code);
  var transporter = nodemailer.createTransport({
    // true for 465, false for other ports
    service: "gmail",
    auth: {
      user: key.user,
      pass: key.pass,
      type: "OAuth2",
      clientId: key.cliendId,
      clientSecret: key.secretKey,
      accessToken: key.accessToken,
      refreshToken: key.refreshToken,
    },
  });

  var mailOptions = {
    from: "devraj@gmail.com",
    to: email,
    subject: "Facebook varification code",
    html: `<h3>Enter these varification code to conform your facebook account</Br> ${varification_code}</h3>`,
  };

  let info = await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.status(500).send("error " + error.message);
    } else {
      res.status(200).json({ message: "success", code: varification_code });
      // res.send("success");
    }
  });
});
router.post("/update_gender", (req, res) => {
  userModel.update({}, { gender: "male" }, (err, doc) => {
    if (err) res.status(500).send("error " + err.message);
    else res.status(200).send("success");
  });
});
router.get("/av",(req,res)=>{
  postModel.find({},(err,doc)=>{
    res.send(doc)
  })
})
router.get("/posts", (req, res) => {
  let friendsEmail = [];
  let post = [];
  console.log(userEmail)
  friendListModel.find({ me: "ramesh@gmail.com" }, async (err, docs) => {
    console.log("docs",docs)
    if (err) {
      return res.status(500).send(err);
    }
    for (let doc of docs) {
      if (doc.friend != userEmail) {
       
        friendsEmail.push(doc.friend);
      }
      
    }
    console.log(friendsEmail)
    for (let email of friendsEmail) {
      let userPost = await postModel.find({ email: email });
      for (let userPostData of userPost) {
        let likedUserEmail = [];
        let posts = [];
        let likeTypesAndId = [];
        userPostData.likes.map((like) => {
          likedUserEmail.push(like.email);
          likeTypesAndId.push({
            _id: like._id,
            isNotified: like.isNotified,
            types: like.types,
          });
        });
        console.log(friendsEmail);
        let likedUsers = await getLikedUSer(likedUserEmail);
        let likes = likedUsers.doc.map((user, i) => {
          return {
            user: {
              name: user.name,
              email: user.email,
              profile: user.profile,
              gender: user.gender,
            },
            id: likeTypesAndId[i]._id,
            isNotified: likeTypesAndId[i].isNotified,
            types: likeTypesAndId[i].types,
          };
        });
        // let postUserInfo = await userModel.findOne({ email: email });
        let totalComments = await getPostTotalComment(userPostData._id);
        userPostData.posts.map((post) => {
          posts.push({
            postType: post.postType,
            _id: post._id,
            post: post.post,
          });
        });
        // console.log(userPostData._id)
        let postUserInfo = await userModel
          .findOne({ email: email })
          .select("name email profile");

        post.push({
          likes: likes,
          tComments: totalComments,
          user: [postUserInfo],
          posts: posts,
          postAt: userPostData.postAt,
          status: userPostData.status,
          postId: userPostData._id,
          reaction: userPostData.reaction,
        });
      }
    }
    // console.log(post)
    res.send(post);
  });
});
router.post("/setSession", (req, res) => {
  req.session.name = "GeeksforGeeks";
  return res.send("Session Set");
});
const setSession = (email) => {
  req.session.email = email;
};
const getSession = () => {
  return req.session.email;
};
router.get('/search',(req,res)=>{
  const key=req.query.key;
  console.log(key);
  userModel.find({$or:[{name:{$regex:key}},{email:{$regex:key}}]}).then((doc)=>{
   
      res.send(doc)
  }).catch((err) => {
    res.status(500).send("no search result found")
  });
})
router.get('/mutual_friend',async(req,res)=>{
  const myEmail = "your_email@example.com";

  // Find all friends for the given email address
  const myFriends = await friendListModel.find({ me: myEmail });
  
  // Extract an array of friend email addresses
  const friendEmails = myFriends.map((friend) => friend.friend);
  
  // Find all friends who have the original email address in their friend field
  const mutualFriends = await friendListModel.find({
    me: { $in: friendEmails },
    friend: myEmail,
  });
  
  // Extract an array of mutual friend email addresses
  const mutualFriendEmails = mutualFriends.map((friend) => friend.me);
  
  // Find all friends of the mutual friends
  const friendOfFriendEmails = [];
  for (const email of mutualFriendEmails) {
    const friendOfFriends = await friendListModel.find({ me: email });
    console.log(`Friends of ${email}:`, friendOfFriends); // Debugging statement
    for (const friend of friendOfFriends) {
      console.log(`Checking friend ${friend.friend}`); // Debugging statement
      if (friendEmails.includes(friend.friend) || friend.friend === myEmail) {
        continue; // Skip existing friends and original user
      }
      friendOfFriendEmails.push(friend.friend);
    }
  }
  console.log("Mutual friends:", mutualFriendEmails); // Debugging statement
  console.log("Friend of friends:", friendOfFriendEmails); // Debugging statement
  
  res.send(friendOfFriendEmails);
  
})




//food
router.post('/create_user',async(req,res)=>{
  const name=req.body.name;
  const email=req.body.email;
  const phone=req.body.phone;
  const password=req.body.password;
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user=new foodUserModel({
    name: name,
    email: email,
    password:hash,
    phone:phone
  });
  user.save((err,doc)=>{
    if(err){
      res.status(500).send("error"+err.message);
    }
    else{
      res.status(200).send(doc);
    }
  })
})
router.post('/items',async(req,res)=>{
  // console.log(req.body);
    const category=req.body.category;
    const subCategory=req.body.subCategory;
    const image=req.body.image;
    const rate=req.body.rate;
    const price=req.body.price;
    const name=req.body.name;
    const resturantName=req.body.resturantName;
    const item=new itemsModel({
      category: category,
      description: req.body.description,
      name: name,
      subCategory: subCategory,
      image:image,
      rate:rate,
      price:price,
      resturantName:resturantName
    })
  await item.save((err,doc)=>{
      if(err){
        res.status(500).send("error "+err.message);
      }
      else{
        res.status(200).send("success");
      }
    })
})
router.post('/resturant',(req,res)=>{
    const location=req.body.location
    const image=req.body.image;
    const resturantName=req.body.resturantName;
    const resturant=new resturantModel({
      location:location,
      image:image,
      resturantName:resturantName
    })
    
    resturant.save().then((doc)=>{
        res.status(200).send("success");
    }).catch((e)=>{
      res.status(500).send("error "+e.message);
    })
})
router.get('/resturant',(req,res)=>{
  const location=req.query.location;
  resturantModel.find({location:location}).then((doc)=>{
    if(doc){
      // console.log("doc",doc);
      res.status(200).send(doc);
    }
    else{
      res.status(404).send("no resturant found");
    }
  }).catch((e)=>{
    res.status(500).send("error "+e.message);
  })
});
router.get('/category',(req,res)=>{
  itemsModel.aggregate([
    { $group: { _id: "$subCategory", doc: { $first: "$$ROOT" } } }
  ]).then((results) => {
    if(results){
      res.send(results);
    }
    else{
      res.status(404).send("no results found");
    }
  }).catch((e)=>{
    res.status(500).send("error "+e.message);
  })
})
router.get('/subCategory',(req,res)=>{
const subCategory=req.query.subCategory;
itemsModel.find({subCategory:subCategory}).then((results)=>{
if(results){
res.send(results);
}
else{
  res.status(404).send("no results found results found");
}
}).catch((e)=>{
  res.status(500).send("error "+e.message)
})
});
router.get('/singleResturant',(req,res)=>{
  console.log("req",req.query.resturant)
 resturantModel.findOne({resturantName:req.query.resturant}).then((result)=>{
  if(res){
    res.status(200).send(result);
  }
 }).catch((e)=>{
  res.status(500).send("error "+e.message)
 })
})
router.get('/singleResturantItems',(req,res)=>{
  itemsModel.aggregate([
    {
      $match:{
        resturantName:req.query.name
      }
    },
    {
      $group:{
        _id:"$subCategory",
        doc:{$first:"$$ROOT"}
      }
    }
  ]).then((result)=>{
    result.map((item)=>{
     console.log(item.doc['name'])
      
    })
    let formattedResult = result.map(item => {
      
        return {
          "_id": item.doc['_id'],
          "category": item.doc['category'],
          "subCategory": item.doc['subCategory'],
          "name": item.doc['name'],
          "resturantName": item.doc['resturantName'],
          "rate": item.doc['rate'] ,
          "price": item.doc['price'],
          "image": item.doc['image'] ,
          "description": item.doc['description'] 
        }
      // console.log(formattedResult)
    });
    res.send(formattedResult);
  })
})
router.get('/category_tab_item',(req,res)=>{
  itemsModel.find({resturantName: req.query.resturant}).then((item)=>{
    if(item){
      res.send(item)
    }
    else{
      res.status(404).send("no item found")
    }
  }).catch((e)=>{
    res.status(500).send(e.message)
  })
})
router.post('/addItemToCart',(req, res)=>{
const itemId=req.body.itemId;
const userId=req.body.userId;
const quantity=req.body.quantity;
cartModel.findOne({userId:userId, itemId:itemId}).then((result)=>{
  if(result){
      cartModel.updateOne({userId:userId,itemId:itemId},{quantity:quantity},(err,doc)=>{
        if(err){
           res.send("error "+err.message)
        }
        else{
          res.send("success")
        }
      })
  }
  else{
    const item=new cartModel({
      quantity: quantity,
      userId: userId,
      itemId: itemId
    })
    console.log(req.body);
    item.save((err,doc)=>{
      if(err){
        res.status(500).send("error"+err.message);
      }
      else{
        res.send(doc)
      }
    })
  }
})

})
router.get('/cartItem',async(req,res)=>{
  const userId = req.query.userId;
  let itemId=[];
  let itemDetails=[];
  let cartDetails=[];
 await cartModel.find({ userId: userId}).then(async(item)=>{
  item.map((val)=>{
    itemId.push(val.itemId);
    cartDetails.push({
      id: val._id,
      quantity:val.quantity
    });
  })
  itemsModel.find({_id:{$in:itemId}},(err,docs)=>{
    docs.map((doc,i)=>{
      console.log(doc.name);
      itemDetails.push({
        name:doc.name,
        image:doc.image,
        quantity:cartDetails[i].quantity,
        id:cartDetails[i].id,
        rate:doc.rate
      })
    })
    res.send(itemDetails)
  })
  
 })
})
router.post('/deleteItem',(req,res)=>{
  const cartId=req.body.cartId;
  console.log(cartId);
  cartModel.deleteOne({_id:cartId},(err,doc)=>{
    console.log(doc);
    if(err){
      res.status(500).send("error: " + err.message);
    }
    else{
      res.status(200).send("success");
    }
  })
})
router.post('/decreaseCartItem',(req,res)=>{
  const userId=req.body.userId;
  const itemId=req.body.itemId;
  const quantity=req.body.quantity;
  console.log("decrease",req.body);
  cartModel.updateOne({itemId:itemId,userId:userId},{quantity:quantity},(err,doc)=>{
    console.log(doc);
    if(err){
      res.status(500).send("error: " + err.message);
    }
    else{
      res.status(200).send("success");
    }
  })
})
router.get('/nearByResturant',(req,res)=>{
  let location=req.query.location
  console.log(location)
  resturantModel.find({location:{$regex:location}},(err,doc)=>{
if(doc){
  res.send(doc);
}
else{
  res.status(404).send("No vendor found near you")
}
})
})
module.exports = router;
