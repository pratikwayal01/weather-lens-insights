
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useWeatherStore } from '@/store/weatherStore';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const configFormSchema = z.object({
  apiKey: z.string().min(1, { message: 'API key is required' }),
  updateInterval: z.coerce.number().min(1).max(60),
  temperatureUnit: z.enum(['celsius', 'fahrenheit'])
});

type ConfigFormValues = z.infer<typeof configFormSchema>;

const SettingsForm: React.FC = () => {
  const { config, updateConfig } = useWeatherStore();
  
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      apiKey: config.apiKey,
      updateInterval: config.updateInterval,
      temperatureUnit: config.temperatureUnit
    }
  });
  
  const onSubmit = (values: ConfigFormValues) => {
    updateConfig(values);
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully."
    });
  };

  return (
    <Card className="shadow-lg max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
        <CardDescription>Configure your weather monitoring preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription>
            A valid OpenWeatherMap API key is required to fetch weather data. The current key is invalid or has not been set.
          </AlertDescription>
        </Alert>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OpenWeatherMap API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your API key" {...field} />
                  </FormControl>
                  <FormDescription className="space-y-2">
                    <p>Get your API key by following these steps:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
                      <li>Sign up for a free account at <a href="https://home.openweathermap.org/users/sign_up" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline inline-flex items-center">OpenWeatherMap <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                      <li>After signing in, go to the API Keys tab in your account</li>
                      <li>Copy your default API key or generate a new one</li>
                      <li>Paste the key above and save settings</li>
                      <li>Note: New API keys may take up to 2 hours to activate</li>
                    </ol>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="updateInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Update Interval (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={60} {...field} />
                  </FormControl>
                  <FormDescription>
                    How often to fetch new weather data (1-60 minutes)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="temperatureUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature Unit</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="celsius">Celsius (°C)</SelectItem>
                      <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose your preferred temperature unit
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">Save Settings</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SettingsForm;
