var express          = require("express"),
	app              = express(),
	bodyParser       = require("body-parser"),
	mongoose         = require("mongoose"),
	methodOverride   = require("method-override"),
	expressSanitizer = require("express-sanitizer");

// APP CONFIG
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// mongoose.connect("mongodb://localhost:27017/restful_blog_app");
mongoose.connect("mongodb+srv://Lisa:****@cluster0-ulpnb.mongodb.net/test?retryWrites=true&w=majority", {
	useNewUrlParser: true,
	useCreateIndex: true
}).then(() => {
	console.log("Connected to DB!");
}).catch(err => {
	console.log("Error: ", err.message);
});

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

// RESTFUL ROUTES

app.get("/", function(req, res) {
	res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", function(req, res) {
	Blog.find({}, function(err, blogs) {
		if(err) {
			console.log(err);
		} else {
			res.render("index", {blogs: blogs});
		}
	});
});

// NEW ROUTE
app.get("/blogs/new", function(req, res) {
	res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function(req, res) {
	// create blog
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, blog) {
		if(err) {
			res.render("new");
		} else {
			// then redirect to index
			res.redirect("/blogs");
		}
	});
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
	Blog.findById(req.params.id, function(err, blog) {
		if(err) {
			res.redirect("/blogs");
		} else {
			// res.send("SHOW PAGE");
			res.render("show", {blog: blog});
		}
	});
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
	// find
    Blog.findById(req.params.id, function(err, blog){
        if(err) {
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: blog});
        }
    });
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    // req.body.blog.body = req.sanitize(req.body.blog.body)
	req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, blog){
      if(err) {
          res.redirect("/blogs");
      } else {
          res.redirect("/blogs/" + req.params.id);
      }
   });
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res) {
	// destroy blog
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
	// redirect somewhere
});

app.listen(3000, function() {
	console.log("SERVER LISTENING!");
});
