from sklearn import metrics
from sklearn.neighbors import NearestNeighbors
from sklearn.naive_bayes import MultinomialNB
import pandas as pd
import numpy as np
import geopandas as gpd
from shapely.geometry import Point

class Prediction():
    def __init__(self, lng, lat):
        self.new_p = [lng, lat]

    def do_KNN_and_naive_bayes(self):
        new_p = self.new_p
        df= pd.read_excel('core/tweets_location.xls')
        #new_p= [-81.33020, 28.5380]    #the point for which i need to know the zipcode
        ## KNN on lat long of the tweetzips.
        n_neighbors=5
        samples=df.as_matrix(['longi','lat'])
        neigh = NearestNeighbors(n_neighbors)
        neigh.fit(samples)
        NearestNeighbors(algorithm='auto', metric='haversine')
        a,b=neigh.kneighbors([new_p])
        tweetzip= self.most_frequent(a,b,df)
        ##create new dataframe to match with the train file
        new_point= pd.DataFrame(index= range(1))
        new_point['predicted_k=%s'%str(n_neighbors)]= tweetzip
        # make a shaply point
        sp= Point(new_p[0],new_p[1])
        sp.crs = {'init' :'epsg:4326'}
        usps= gpd.GeoDataFrame.from_file('core/maps/usps_wgs84.shp')
        esri= gpd.GeoDataFrame.from_file('core/maps/esri_wgs84.shp')
        zcta= gpd.GeoDataFrame.from_file('core/maps/zcta_wgs84.shp')
        map1= gpd.GeoDataFrame.from_file('core/maps/map1_wgs84.shp')

        usps.crs = {'init' :'epsg:4326'}
        esri.crs = {'init' :'epsg:4326'}
        zcta.crs = {'init' :'epsg:4326'}
        map1.crs = {'init' :'epsg:4326'}
        
        usps= usps.loc[usps.zipc >30000]
        esri= esri.loc[esri.ZIP_number >30000]
        zcta.ZCTA5CE10= zcta.ZCTA5CE10.astype(int)
        zcta= zcta.loc[zcta.ZCTA5CE10 >30000]
        map1.ZIP= map1.ZIP.astype(int)
        map1= map1.loc[map1.ZIP >30000]

        ##intersect geodataframe of the point to the polygon geodataframe and get the zipcode
        pnt = gpd.GeoDataFrame(geometry=[sp])
        usps_int=gpd.sjoin(pnt, usps[['zipc','geometry']], how='left', op='intersects')
        
        new_point['tweet_usps'] = usps_int.zipc
        esri_int=gpd.sjoin(pnt, esri[['ZIP_number','geometry']], how='left', op='intersects')
        zcta_int=gpd.sjoin(pnt, zcta[['ZCTA5CE10','geometry']], how='left', op='intersects')
        map1_int=gpd.sjoin(pnt, map1[['ZIP','geometry']], how='left', op='intersects')
        
        new_point['tweet_map'] = map1_int.ZIP
        new_point['tweet_zcta'] = zcta_int.ZCTA5CE10
        new_point['tweet_esri'] = esri_int.ZIP_number
        new_point=new_point[['tweet_usps','tweet_map','tweet_zcta','tweet_esri','predicted_k=5']]

        naive_train= pd.read_csv('core/k5_forNaive_allmap.csv')
        
        X_train=naive_train[['tweet_map','tweet_zcta','tweet_esri','predicted_k=5']].values
        y_train=naive_train[['tweet_usps']].values
        X_test=new_point[['tweet_map','tweet_zcta','tweet_esri','predicted_k=5']].values
        y_test=new_point[['tweet_usps']].values

        clf = MultinomialNB().fit(X_train, y_train)
        
        y_pred=clf.predict(new_point[['tweet_map','tweet_zcta','tweet_esri','predicted_k=5']])

#        return new_p

        return int(y_pred)

    ##get the tweetzip for closest k neighbors
    def most_frequent(self, val, idx, df):
        min_idx=idx[np.where(val == val.min())]               #index of closest neighbor
        min_zip=df.zip.iloc[df.index==min_idx[0].item()].item()  #zip of closest neighbor
        zipc=[]
        for i in idx[0]:
            z=df.zip.iloc[df.index==i].item()
            zipc.append(z)
        if len(set(zipc)) == len(zipc):   #if all are unique neighbor-returns closest one, else- most occurance
            return(min_zip)
        else:
            return max(set(zipc), key = zipc.count)
