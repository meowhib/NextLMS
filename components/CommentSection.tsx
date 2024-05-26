export default function CommentSection() {
  const comments = [
    {
      id: 1,
      content: "This is a comment",
      user: {
        id: 1,
        name: "John Doe",
      },
    },
    {
      id: 2,
      content: "This is another comment",
      user: {
        id: 2,
        name: "Jane Doe",
      },
    },
    {
      id: 3,
      content: "This is yet another comment",
      user: {
        id: 3,
        name: "John Smith",
      },
    },
  ];

  return (
    <div>
      <h1>Comment Section</h1>
      <div>
        {comments.map((comment) => (
          <div key={comment.id}>
            <h2>{comment.user.name}</h2>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
