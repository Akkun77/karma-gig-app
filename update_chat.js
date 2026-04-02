const fs = require('fs');
const file = 'c:/Users/anime/.gemini/antigravity/brain/8e034857-ee0e-44ba-81d9-5a637578a879/proto/karmgig/app/(app)/messages/[chatId]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add deleteDoc import
content = content.replace(
  'getDoc,\n  limit\n} from "firebase/firestore";',
  'getDoc,\n  limit,\n  deleteDoc\n} from "firebase/firestore";'
);

// 2. Add handleDelete function before return
const insertFn = `
  const handleDelete = async (msgId: string) => {
    if (window.confirm("Delete this message for everyone?")) {
      try {
        await deleteDoc(doc(db, "chats", chatId, "messages", msgId));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const currentUid = user?.uid;
`;
content = content.replace('  const currentUid = user?.uid;', insertFn);

// 3. Add onClick to message container
content = content.replace(
  'className={`max-w-[72%] min-w-0 px-4 py-2.5 shadow-sm text-[15px] leading-relaxed break-words overflow-hidden ${',
  'onClick={() => isMe && handleDelete(m.id)}\n                    className={`max-w-[72%] cursor-pointer min-w-0 px-4 py-2.5 shadow-sm text-[15px] leading-relaxed break-words overflow-hidden hover:opacity-90 transition-opacity ${'
);

fs.writeFileSync(file, content);
console.log("Chat updated!");
