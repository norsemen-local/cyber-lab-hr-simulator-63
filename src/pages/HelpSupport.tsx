
import { useState } from "react";
import DashboardWithSidebar from "../components/dashboard/DashboardWithSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  ChevronRight, 
  ThumbsUp, 
  ThumbsDown, 
  Send,
  Mail,
  PhoneCall,
  AlertTriangle
} from "lucide-react";

const HelpSupport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [supportMessage, setSupportMessage] = useState("");

  const faqs = [
    {
      question: "How do I request time off?",
      answer: "To request time off, navigate to the Time Management page, click on 'Leave Requests', and then click the 'New Request' button. Fill out the required information including the type of leave, start and end dates, and any comments. Your manager will receive a notification to approve or deny your request."
    },
    {
      question: "How do I update my personal information?",
      answer: "To update your personal information, go to your Profile page by clicking on 'My Profile' in the sidebar. In the Personal Info tab, you can update your contact details, emergency contacts, and other personal information. Remember to click the Save button after making changes."
    },
    {
      question: "How do I view my pay stubs?",
      answer: "Pay stubs can be accessed through the Documents section. Navigate to Documents in the sidebar, then filter by 'Pay Stubs' category. You can view and download PDF versions of all your past pay stubs."
    },
    {
      question: "How do I reset my password?",
      answer: "If you're logged in, you can reset your password by going to Settings > Security and following the password change process. If you're locked out, use the 'Forgot Password' link on the login page to receive a password reset email."
    },
    {
      question: "How do I enroll in benefits?",
      answer: "Benefit enrollment is typically available during the annual open enrollment period or when you experience a qualifying life event. Navigate to the Benefits section from the dashboard and select 'Enroll Now' to view available options and complete your enrollment."
    },
    {
      question: "How do I submit an expense report?",
      answer: "To submit an expense report, go to the Finance section, select 'Expense Reports', and click 'New Report'. Enter the required details, attach receipts by uploading images or PDFs, and submit for approval. You can track the status of your submission on the same page."
    }
  ];

  const recentArticles = [
    { 
      id: 1, 
      title: "Understanding the New Remote Work Policy", 
      category: "Policies", 
      date: "Nov 5, 2023",
      views: 256
    },
    { 
      id: 2, 
      title: "Quick Guide to the Performance Review Process", 
      category: "Guides", 
      date: "Oct 28, 2023",
      views: 187
    },
    { 
      id: 3, 
      title: "How to Use the New Timesheet System", 
      category: "Tutorials", 
      date: "Oct 15, 2023",
      views: 321
    },
    { 
      id: 4, 
      title: "Benefits Open Enrollment Period Announced", 
      category: "Announcements", 
      date: "Oct 8, 2023",
      views: 412
    },
  ];

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the support message to an API
    console.log("Support message submitted:", supportMessage);
    // Clear the input
    setSupportMessage("");
    // Show a confirmation - in a real app, would use toast
    alert("Your support request has been submitted. Someone will get back to you shortly.");
  };

  return (
    <DashboardWithSidebar>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Help & Support</h1>
        <p className="text-gray-600">Find answers, get assistance, and learn more about the HR Portal</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          className="pl-10 py-6 text-lg rounded-lg shadow-sm"
          placeholder="Search for help articles, FAQs, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="faq" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="faq" className="flex items-center">
                <HelpCircle className="h-4 w-4 mr-2" />
                FAQs
              </TabsTrigger>
              <TabsTrigger value="articles" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Knowledge Base
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Support
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="faq">
              <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredFAQs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No matching FAQs found. Try a different search term.</p>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="w-full">
                      {filteredFAQs.map((faq, index) => (
                        <AccordionItem key={index} value={`faq-${index}`}>
                          <AccordionTrigger className="text-left font-medium">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600">
                            <div className="pb-4">{faq.answer}</div>
                            <div className="flex justify-between items-center pt-2 border-t text-sm">
                              <div className="text-gray-500">Was this helpful?</div>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  Yes
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <ThumbsDown className="h-4 w-4 mr-1" />
                                  No
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="articles">
              <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Knowledge Base</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                        All
                      </Badge>
                      <Badge variant="outline" className="hover:bg-gray-100">
                        Policies
                      </Badge>
                      <Badge variant="outline" className="hover:bg-gray-100">
                        Guides
                      </Badge>
                      <Badge variant="outline" className="hover:bg-gray-100">
                        Tutorials
                      </Badge>
                      <Badge variant="outline" className="hover:bg-gray-100">
                        Announcements
                      </Badge>
                    </div>
                    
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {recentArticles.map(article => (
                          <div key={article.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium">{article.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {article.category}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>Published: {article.date}</span>
                              <span>{article.views} views</span>
                            </div>
                            <Button variant="ghost" size="sm" className="mt-2 text-purple-600 p-0 h-auto">
                              Read article <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        ))}
                        
                        {/* More article categories */}
                        <div className="pt-4">
                          <h3 className="font-medium mb-3">Employee Benefits</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                <span>Health Insurance Overview</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                <span>401(k) Plan Details</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                <span>Parental Leave Policy</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="contact">
              <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Contact Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSupportSubmit}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                            Your Name
                          </label>
                          <Input id="name" defaultValue="John Anderson" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                            Your Email
                          </label>
                          <Input id="email" type="email" defaultValue="john.anderson@techpro.com" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="subject">
                          Subject
                        </label>
                        <Input id="subject" placeholder="What's your question about?" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="message">
                          Message
                        </label>
                        <Textarea 
                          id="message" 
                          rows={5} 
                          placeholder="Describe your issue or question in detail..."
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                        />
                      </div>
                      
                      <div className="pt-3">
                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                          <Send className="h-4 w-4 mr-2" />
                          Submit Support Request
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-purple-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium">Email Support</h3>
                    <p className="text-sm text-gray-600">support@techprosolutions.com</p>
                    <p className="text-xs text-gray-500 mt-1">Response within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <PhoneCall className="h-5 w-5 text-purple-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium">Phone Support</h3>
                    <p className="text-sm text-gray-600">+1 (555) 456-7890</p>
                    <p className="text-xs text-gray-500 mt-1">Mon-Fri, 9 AM - 5 PM EST</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-2">IT Support Hours</h3>
                  <div className="text-sm">
                    <div className="flex justify-between py-1">
                      <span>Monday - Friday</span>
                      <span>8:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Saturday</span>
                      <span>10:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Need Urgent Help?</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    For critical issues affecting your ability to work, please call our emergency support line at:
                  </p>
                  <p className="text-sm font-medium mt-2">+1 (555) 911-HELP</p>
                  <p className="text-xs text-gray-500 mt-1">Available 24/7 for emergencies only</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardWithSidebar>
  );
};

export default HelpSupport;
