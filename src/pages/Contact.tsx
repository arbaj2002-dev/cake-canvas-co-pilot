import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you soon!"
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="hero-text text-4xl mb-4">Contact Us</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a question or special request? We'd love to hear from you. Get in touch with our team!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="What's this about?"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder="Tell us more about your query or special requirements..."
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-button shadow-button"
                    disabled={isLoading}
                  >
                    {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />}
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Visit Our Shop</p>
                      <p className="text-muted-foreground text-sm">
                        123 Sweet Street, Cake Town<br />
                        Mumbai, Maharashtra 400001<br />
                        India
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Call Us</p>
                      <p className="text-muted-foreground text-sm">
                        +91 89750 48440<br />
                        +91 98765 43210
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Email Us</p>
                      <p className="text-muted-foreground text-sm">
                        orders@sweetcakes.com<br />
                        support@sweetcakes.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <div className="text-muted-foreground text-sm">
                        <p>Monday - Saturday: 9:00 AM - 9:00 PM</p>
                        <p>Sunday: 10:00 AM - 6:00 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>💡 <strong>Custom Orders:</strong> Need a special cake? Give us 48 hours notice for custom designs.</p>
                  <p>🚚 <strong>Delivery:</strong> We deliver within 10km radius. Same-day delivery available for orders before 2 PM.</p>
                  <p>🎉 <strong>Bulk Orders:</strong> Special discounts available for orders above ₹5000.</p>
                  <p>📞 <strong>Urgent Orders:</strong> For same-day urgent orders, please call us directly.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Interactive Map Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Find Us on Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Placeholder for interactive map */}
              <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="text-center z-10">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Sweet Cakes Bakery</h3>
                  <p className="text-muted-foreground">
                    123 Sweet Street, Cake Town, Mumbai
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => window.open('https://maps.google.com/?q=123+Sweet+Street+Cake+Town+Mumbai', '_blank')}
                  >
                    Get Directions
                  </Button>
                </div>
                
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="grid grid-cols-8 gap-4 h-full w-full p-4">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className="bg-primary rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>Click "Get Directions" to open in Google Maps for navigation</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;