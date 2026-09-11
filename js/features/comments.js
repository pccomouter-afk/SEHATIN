const CommentsFeature = {
  getComments(articleId) {
    var all = Storage.get('comments', []);
    return all.filter(function(c) { return c.articleId === articleId; });
  },

  addComment(articleId, content) {
    var user = Auth.currentUser() || { name: 'Pengguna' };
    var comments = this.getComments(articleId);
    var comment = {
      id: Utils.uid('cmt'),
      articleId: articleId,
      userId: user.id || 'anonymous',
      userName: user.name,
      userAvatar: this.getAvatar(user.name),
      content: content,
      createdAt: Date.now()
    };
    var all = Storage.get('comments', []);
    all.push(comment);
    Storage.set('comments', all);
    return comment;
  },

  deleteComment(commentId) {
    var all = Storage.get('comments', []);
    var filtered = all.filter(function(c) { return c.id !== commentId; });
    Storage.set('comments', filtered);
    return filtered;
  },

  getAvatar(name) {
    var profileImage = Storage.get('sehatin_user', {}).profileImage;
    if (profileImage) return profileImage;
    return null;
  },

  formatContent(content) {
    var div = document.createElement('div');
    div.textContent = content || '';
    return div.innerHTML;
  }
};

window.CommentsFeature = CommentsFeature;
