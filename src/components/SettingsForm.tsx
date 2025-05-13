
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      </CardHeader>
      <CardContent>
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
                  <FormDescription>
                    Get your API key from <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">OpenWeatherMap</a>
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
