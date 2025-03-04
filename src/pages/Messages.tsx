
import { useState } from "react";
import DashboardWithSidebar from "../components/dashboard/DashboardWithSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Search, Send, Filter, Star, Clock, User, MoreVertical, Paperclip } from "lucide-react";

interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Contact {
  id: number;
  name: string;
  avatar: string;
  lastSeen: string;
  online: boolean;
  unreadCount: number;
}

const Messages = () => {
  const [activeTab, setActiveTab] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageInput, setMessageInput] = useState("");
  
  const contacts: Contact[] = [
    { id: 1, name: "Jane Smith", avatar: "JS", lastSeen: "just now", online: true, unreadCount: 3 },
    { id: 2, name: "John Doe", avatar: "JD", lastSeen: "2 hours ago", online: false, unreadCount: 0 },
    { id: 3, name: "Michael Brown", avatar: "MB", lastSeen: "yesterday", online: false, unreadCount: 1 },
    { id: 4, name: "Sarah Johnson", avatar: "SJ", lastSeen: "just now", online: true, unreadCount: 0 },
    { id: 5, name: "Robert Wilson", avatar: "RW", lastSeen: "3 days ago", online: false, unreadCount: 0 }
  ];

  const messagesByContact: Record<number, Message[]> = {
    1: [
      { id: 1, senderId: 1, recipientId: 0, content: "Hi there! I had a question about the new HR policy.", timestamp: "10:30 AM", read: true },
      { id: 2, senderId: 0, recipientId: 1, content: "Of course, Jane. What would you like to know?", timestamp: "10:32 AM", read: true },
      { id: 3, senderId: 1, recipientId: 0, content: "Does the new remote work policy apply to all departments?", timestamp: "10:35 AM", read: true },
      { id: 4, senderId: 0, recipientId: 1, content: "Yes, it applies to all departments except for those with on-site requirements. I can send you the full documentation if that would help.", timestamp: "10:40 AM", read: true },
      { id: 5, senderId: 1, recipientId: 0, content: "That would be great, thank you!", timestamp: "10:42 AM", read: false },
      { id: 6, senderId: 1, recipientId: 0, content: "Also, when does this policy take effect?", timestamp: "10:43 AM", read: false },
      { id: 7, senderId: 1, recipientId: 0, content: "Sorry for all the questions!", timestamp: "10:44 AM", read: false },
    ],
    3: [
      { id: 8, senderId: 3, recipientId: 0, content: "Hey, I submitted my timesheet but it's showing as incomplete.", timestamp: "Yesterday", read: false }
    ]
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedContact) return;
    
    // In a real app, this would send the message to an API
    console.log(`Sending message to ${selectedContact.name}: ${messageInput}`);
    
    // Clear the input field
    setMessageInput("");
  };

  return (
    <DashboardWithSidebar>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Messages</h1>
        <p className="text-gray-600">Communicate with your team members and managers</p>
      </div>

      <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
            {/* Contacts sidebar */}
            <div className="border-r">
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search messages..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Tabs defaultValue="inbox" onValueChange={setActiveTab}>
                  <TabsList className="w-full">
                    <TabsTrigger value="inbox" className="flex-1">Inbox</TabsTrigger>
                    <TabsTrigger value="starred" className="flex-1">Starred</TabsTrigger>
                    <TabsTrigger value="sent" className="flex-1">Sent</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <ScrollArea className="h-[500px]">
                {activeTab === "inbox" && filteredContacts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No conversations found</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredContacts.map(contact => (
                      <div 
                        key={contact.id}
                        className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-gray-100 ${selectedContact?.id === contact.id ? 'bg-gray-100' : ''}`}
                        onClick={() => setSelectedContact(contact)}
                      >
                        <div className="relative mr-3">
                          <Avatar>
                            <AvatarFallback>{contact.avatar}</AvatarFallback>
                          </Avatar>
                          {contact.online && (
                            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-medium truncate">{contact.name}</h3>
                            <span className="text-xs text-gray-500">{contact.lastSeen}</span>
                          </div>
                          {messagesByContact[contact.id] && (
                            <p className="text-sm text-gray-500 truncate">
                              {messagesByContact[contact.id][messagesByContact[contact.id].length - 1].content}
                            </p>
                          )}
                        </div>
                        {contact.unreadCount > 0 && (
                          <Badge className="ml-2 bg-purple-600">{contact.unreadCount}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
            
            {/* Conversation area */}
            <div className="col-span-2 flex flex-col h-full">
              {selectedContact ? (
                <>
                  <div className="border-b p-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <Avatar className="mr-2">
                        <AvatarFallback>{selectedContact.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{selectedContact.name}</h3>
                        <p className="text-xs text-gray-500">
                          {selectedContact.online ? 'Online' : `Last seen ${selectedContact.lastSeen}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messagesByContact[selectedContact.id]?.map(message => (
                        <div 
                          key={message.id}
                          className={`flex ${message.senderId === 0 ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.senderId === 0 
                                ? 'bg-purple-600 text-white rounded-br-none' 
                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${message.senderId === 0 ? 'text-purple-200' : 'text-gray-500'}`}>
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="p-4 border-t">
                    <div className="flex items-end gap-2">
                      <Textarea 
                        placeholder="Type your message..." 
                        className="min-h-[60px]"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <div className="flex">
                        <Button variant="ghost" size="icon" type="button">
                          <Paperclip className="h-5 w-5" />
                        </Button>
                        <Button 
                          className="bg-purple-600 hover:bg-purple-700" 
                          size="icon"
                          onClick={sendMessage}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-500">
                  <MessageCircle className="h-16 w-16 mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                  <p>Choose a contact from the list to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardWithSidebar>
  );
};

// Add Phone icon that we forgot to import
const Phone = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

export default Messages;
