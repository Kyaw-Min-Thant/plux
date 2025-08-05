import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, MessageSquare, FolderOpen, Plus, Settings, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FileText className="w-5 h-5" />,
      title: "File Explorer",
      description: "Browse and explore your project files with an intuitive tree structure"
    },
    {
      icon: <Plus className="w-5 h-5" />,
      title: "Context Management",
      description: "Add files to AI context by clicking the + button in the file tree"
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "AI Chat Interface",
      description: "Chat with AI about your project with file context automatically included"
    },
    {
      icon: <Settings className="w-5 h-5" />,
      title: "MCP Integration",
      description: "Connect with Model Context Protocol servers for enhanced functionality"
    }
  ];

  const quickActions = [
    {
      label: "Start Chat",
      action: () => {
        // Force navigation to chat page by providing a dummy message or context
        navigate("/");
      },
      icon: <MessageSquare className="w-4 h-4" />,
      variant: "default" as const
    },
    {
      label: "Settings", 
      action: () => navigate("/settings"),
      icon: <Settings className="w-4 h-4" />,
      variant: "outline" as const
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Plux</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A powerful desktop application for interacting with AI models using file context. 
          Browse your projects, add files to context, and chat with AI about your file.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-4">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            onClick={action.action}
            className="flex items-center gap-2"
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {feature.icon}
                </div>
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How to Use */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            How to Use
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <div>
                <p className="font-medium">Navigate to Chat</p>
                <p className="text-sm text-gray-600">Click "Start Chat" or use the main chat interface</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <div>
                <p className="font-medium">Browse Files</p>
                <p className="text-sm text-gray-600">Use the file tree on the left to explore your project</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <div>
                <p className="font-medium">Add Context</p>
                <p className="text-sm text-gray-600">Click the + button next to any file or folder to add it to your chat context</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <div>
                <p className="font-medium">Chat with AI</p>
                <p className="text-sm text-gray-600">Ask questions - the AI will have access to the files you've added</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}