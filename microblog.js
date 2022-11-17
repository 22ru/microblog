// Config
var DisplayLatestPosts = 0;
var RSSLink = "../microblog/microblog.xml";
var DisplaySubscribe = 1;
var SubscribeText = "Follow";
var DisplayLikes = 1;
var LikeSymbol = "❤️";
var UnlikeSymbol = "🤍";
var DisplayReblog = 1;
var ReblogSymbol = "♻️";
var NoReblogSymbol = "♼";

// stolen shamelessly from w3schools
function retrieveXML() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      buildPage(this);
    }
  };
  xhttp.open("GET", RSSLink, true);
  xhttp.send();
}

function buildPage(xml) {
  var xmlDoc;
  var authorName, username, iconLink, rootLink, bioText;
  var anchor, i;
  var container;
  var postsDisplayed;
  var items;
    
  xmlDoc = xml.responseXML;

  authorName = xmlDoc.getElementsByTagName("webMaster")[0].innerHTML;
  username = xmlDoc.getElementsByTagName("generator")[0].innerHTML;
  iconLink = xmlDoc.getElementsByTagName("image")[0].getElementsByTagName("url")[0].innerHTML;
  rootLink = xmlDoc.getElementsByTagName("link")[0].innerHTML;
  bioText = xmlDoc.getElementsByTagName("description")[0].innerHTML;
  
  container = document.createElement("div");
  container.id = "container";
  document.body.appendChild(container);
    
  loadHeader(xmlDoc, authorName, username, iconLink, rootLink, bioText);
    
  if (DisplaySubscribe) loadSubscribe(RSSLink);
    
  items = xmlDoc.getElementsByTagName("item");

  // Check anchor
  anchor = window.location.hash.replace("#", '');

  // no anchor or invalid anchor, build feed
  if (anchor == "" || isNaN(anchor)) {
    if (DisplayLatestPosts > 0) { 
      postsDisplayed = DisplayLatestPosts;
    } else {
      postsDisplayed = items.length;
    }
    for (i = 0; i < postsDisplayed; i++) {
      loadSingle(items[i], authorName, username, iconLink, rootLink);
    }
  // load single post
  } else {
    for (i = 0; i < items.length; i++) {
      if (anchor == items[i].getElementsByTagName("guid")[0].innerHTML) {
        loadSingle(items[i], authorName, username, iconLink, rootLink);
        return;
      }
    }
  }
}

function loadHeader(xmlDoc, authorName, username, iconLink, rootLink, bioText) {
  var header, authorLink, icon, author, user, bio; 
  
  header = document.createElement("div");
  header.id = "header";
  authorLink = document.createElement("a");
  authorLink.href = rootLink;
  icon = document.createElement("img");
  icon.className = "profilePic";
  icon.src = iconLink;
  authorLink.appendChild(icon);
  author = document.createElement("h1");
  author.id = "name";
  author.innerHTML = authorName;
  user = document.createElement("p");
  user.id = "username";
  user.innerHTML = username;
  bio = document.createElement("p");
  bio.id = "bio";
  bio.innerHTML = bioText;
    
  header.appendChild(authorLink);
  header.appendChild(author);
  header.appendChild(user);
  header.appendChild(bio);
    
  document.getElementById("container").appendChild(header);
}

function loadSubscribe(RSSLink) {
  var subLink, subButton;
  
  subLink = document.createElement("a");
  subButton = document.createElement("button");
  
  subLink.href = RSSLink;
  subLink.innerHTML = SubscribeText;
  subLink.className = "subscribeButton";
  subButton.appendChild(subLink);
  
  document.getElementById("container").appendChild(subLink);
}

function loadSingle(rssItem, authorName, username, iconLink, rootLink) {
  var post, authorLink, icon, content, authorDate, author, dateLink, text, imageLink;
  var imagesPrecount, i, images;
    
  post = document.createElement("div");
  post.className = "post";
  post.id = rssItem.getElementsByTagName("guid")[0].innerHTML;
  
  authorLink = document.createElement("a");
  authorLink.href = rootLink;
  icon = document.createElement("img");
  icon.className = "profilePic";
  icon.src = iconLink;
  authorLink.appendChild(icon);
  post.appendChild(authorLink);
  
  content = document.createElement("div");
  content.className = "postContent";
  
  authorDate = document.createElement("div");
  authorDate.className = "authorDate";
  
  author = document.createElement("div");
  author.className = "author";
  author.innerHTML = "<span class='authorName'>" + authorName + "</span>";
  // Only add a space if there is something in front of it
  if (authorName.length > 0) author.innerHTML += " ";
  author.innerHTML += "<span class='username'>" + username + "</span>";
  
  dateLink = document.createElement("a");
  dateLink.href = "#" + rssItem.getElementsByTagName("guid")[0].innerHTML;
  dateLink.className = "postDate";
  dateLink.innerHTML = rssItem.getElementsByTagName("pubDate")[0].innerHTML;
  dateLink.setAttribute("onclick","document.body.innerHTML = ''; retrieveXML();");
  
  authorDate.appendChild(author);
  authorDate.appendChild(dateLink);
  content.appendChild(authorDate);

  text = document.createElement("div");
  text.className = "postText";
  text.innerHTML = rssItem.getElementsByTagName("title")[0].innerHTML;
  
  imageLink = rssItem.getElementsByTagName("description")[0].innerHTML;
  // Store the number of images that may exist before the post images are appended
  // so that we don't add the postImage class to them
  imagesPreCount = content.getElementsByTagName("img").length;
  content.appendChild(text);
  if (imageLink.length > 0) {
    content.innerHTML += imageLink;
    images = content.getElementsByTagName("img");
    for (i = imagesPreCount; i < images.length; i++) {
      images[i].className = "postImage";
    }
  }
  
  if (DisplayReblog || DisplayLikes) {
    content.append(loadInteractions(rssItem.getElementsByTagName("guid")[0].innerHTML)); 
  }
  
  post.appendChild(content);
  document.getElementById("container").appendChild(post);
}

function loadInteractions(guid) {
  var interactions, reblogButton, reblogCount, likeButton, likeCount;
  
  interactions = document.createElement("div");
  interactions.className = "interactions";
  
  if (DisplayReblog) {
    reblogButton = document.createElement("span");
    reblogButton.className = "reblogButton";
    reblogButton.setAttribute("onclick", "reblogPost(" + guid + ")");
    reblogButton.innerHTML = NoReblogSymbol;
    reblogCount = document.createElement("span");
    reblogCount.className = "reblogCount";
    reblogCount.innerHTML = "0";
  
    interactions.appendChild(reblogButton);
    interactions.appendChild(reblogCount);
  }
  
  if (DisplayLikes) {
    likeButton = document.createElement("span");
    likeButton.className = "likeButton";
    likeButton.setAttribute("onclick", "likePost(" + guid + ")");
    likeButton.innerHTML = UnlikeSymbol;
    likeCount = document.createElement("span");
    likeCount.className = "likeCount";
    likeCount.innerHTML = "0";
  
    interactions.appendChild(likeButton);
    interactions.appendChild(likeCount);
  }
  
  return interactions;
}

function likePost(guid) {
  var post;
  post = document.getElementById(guid).getElementsByClassName("interactions")[0];
  post.getElementsByClassName("likeButton")[0].setAttribute("onclick", "unlikePost(" + guid + ")");
  post.getElementsByClassName("likeButton")[0].innerHTML = LikeSymbol;
  post.getElementsByClassName("likeCount")[0].innerHTML = "1";
}

function unlikePost(guid) {
  var post;
  post = document.getElementById(guid).getElementsByClassName("interactions")[0];
  post.getElementsByClassName("likeButton")[0].setAttribute("onclick", "likePost(" + guid + ")");
  post.getElementsByClassName("likeButton")[0].innerHTML = UnlikeSymbol;
  post.getElementsByClassName("likeCount")[0].innerHTML = "0";
}

function reblogPost(guid) {
  var post;
  post = document.getElementById(guid).getElementsByClassName("interactions")[0];
  post.getElementsByClassName("reblogButton")[0].setAttribute("onclick", "unreblogPost(" + guid + ")");
  post.getElementsByClassName("reblogButton")[0].innerHTML = ReblogSymbol;
  post.getElementsByClassName("reblogCount")[0].innerHTML = "1";
}

function unreblogPost(guid) {
  var post;
  post = document.getElementById(guid).getElementsByClassName("interactions")[0];
  post.getElementsByClassName("reblogButton")[0].setAttribute("onclick", "reblogPost(" + guid + ")");
  post.getElementsByClassName("reblogButton")[0].innerHTML = NoReblogSymbol;
  post.getElementsByClassName("reblogCount")[0].innerHTML = "0";
}
