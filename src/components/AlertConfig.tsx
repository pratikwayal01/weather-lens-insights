
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

const alertConfigSchema = z.object({
  enabled: z.boolean(),
  high_temp: z.coerce.number().min(-50).max(60),
  low_temp: z.coerce.number().min(-50).max(60),
  consecutive_readings: z.coerce.number().min(1).max(10),
  weather_condition: z.string()
});

type AlertConfigValues = z.infer<typeof alertConfigSchema>;

interface AlertConfigProps {
  cityId: string;
  cityName: string;
}

const AlertConfig: React.FC<AlertConfigProps> = ({ cityId, cityName }) => {
  const { config, updateCityAlertConfig } = useWeatherStore();
  const cityAlertConfig = config.alerts[cityId];
  
  const form = useForm<AlertConfigValues>({
    resolver: zodResolver(alertConfigSchema),
    defaultValues: {
      enabled: cityAlertConfig?.enabled ?? true,
      high_temp: cityAlertConfig?.high_temp ?? 35,
      low_temp: cityAlertConfig?.low_temp ?? 10,
      consecutive_readings: cityAlertConfig?.consecutive_readings ?? 2,
      weather_condition: cityAlertConfig?.weather_condition ?? 'none'
    }
  });
  
  const onSubmit = (values: AlertConfigValues) => {
    updateCityAlertConfig(cityId, values);
    toast({
      title: "Alert settings saved",
      description: `Alert settings for ${cityName} have been updated.`
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Alert Settings for {cityName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Alerts</FormLabel>
                    <FormDescription>
                      Receive alerts when weather conditions meet thresholds
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="high_temp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>High Temperature Threshold</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Alert when temperature exceeds this value
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="low_temp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Low Temperature Threshold</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Alert when temperature falls below this value
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="consecutive_readings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consecutive Readings</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={10} {...field} />
                  </FormControl>
                  <FormDescription>
                    Number of consecutive readings required to trigger temperature alerts
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="weather_condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weather Condition Alert</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="Thunderstorm">Thunderstorm</SelectItem>
                      <SelectItem value="Drizzle">Drizzle</SelectItem>
                      <SelectItem value="Rain">Rain</SelectItem>
                      <SelectItem value="Snow">Snow</SelectItem>
                      <SelectItem value="Mist">Mist</SelectItem>
                      <SelectItem value="Fog">Fog</SelectItem>
                      <SelectItem value="Clear">Clear</SelectItem>
                      <SelectItem value="Clouds">Clouds</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Alert when this specific weather condition occurs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit">Save Alert Settings</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AlertConfig;
